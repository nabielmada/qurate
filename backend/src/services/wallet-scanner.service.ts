import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

export interface TokenBalance {
  symbol: string;
  chain: string;
  balance: number;
  usdValue: number;
}

const CHAIN_CONFIG = {
  Ethereum: 'eth-mainnet',
  Polygon: 'polygon-mainnet',
  Base: 'base-mainnet',
  'Base Sepolia': 'base-sepolia', // Tambahkan support Testnet untuk Demo
  Arbitrum: 'arb-mainnet',
};

@Injectable()
export class WalletScannerService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.ALCHEMY_API_KEY || '';
  }

  async scanWallet(walletAddress: string): Promise<TokenBalance[]> {
    // 1. Terima wallet address & error handling
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new HttpException('Format wallet address tidak valid', HttpStatus.BAD_REQUEST);
    }

    if (!this.apiKey) {
      console.warn('ALCHEMY_API_KEY belum dikonfigurasi di .env!');
      // Untuk hackathon MVP, kita tidak langsung melempar error agar app tidak mati, tapi beri peringatan.
    }

    const allTokens: TokenBalance[] = [];
    const chains = Object.keys(CHAIN_CONFIG);

    // 2. Fetch ke semua chain secara paralel
    await Promise.all(
      chains.map(async (chain) => {
        try {
          const network = CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG];
          const url = `https://${network}.g.alchemy.com/v2/${this.apiKey}`;

          // --- A. FETCH NATIVE ETH BALANCE ---
          const ethBalanceRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [walletAddress, 'latest'],
              id: 1,
            }),
          });
          
          if (ethBalanceRes.ok) {
            const ethData = await ethBalanceRes.json();
            const rawBalance = BigInt(ethData.result || '0').toString();
            const balance = Number(rawBalance) / 1e18;

            if (balance > 0) {
              const symbol = chain.includes('Polygon') ? 'POL' : 'ETH';
              allTokens.push({
                symbol,
                chain,
                balance,
                usdValue: balance * 3000 // Treat Testnet ETH as Real ETH price for demo simulation
              });
            }
          }

          // --- B. FETCH ERC20 TOKENS ---
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'alchemy_getTokenBalances',
              params: [walletAddress, 'erc20'],
              id: 1,
            }),
          });

          if (!response.ok) return;

          const data = await response.json();
          if (data.error) return;

          const tokenBalances = data.result?.tokenBalances || [];

          // Filter saldo 0
          const activeBalances = tokenBalances.filter(
            (token: any) => token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
          );

          // Get metadata untuk mendapatkan symbol & konversi desimal secara paralel
          await Promise.all(activeBalances.map(async (token: any) => {
            try {
              const metaResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'alchemy_getTokenMetadata',
                  params: [token.contractAddress],
                  id: 1,
                }),
              });

              if (metaResponse.ok) {
                const metaData = await metaResponse.json();
                const symbol = metaData.result?.symbol || 'UNKNOWN';
                const decimals = metaData.result?.decimals || 18;
                const rawBalance = BigInt(token.tokenBalance).toString();
                const balance = Number(rawBalance) / Math.pow(10, decimals);

                // Kalkulasi usdValue (Untuk MVP hackathon kita gunakan dummy converter)
                let usdValue = 0;
                if (symbol === 'USDC' || symbol === 'USDT') usdValue = balance;
                else if (symbol === 'ETH' || symbol === 'WETH') usdValue = balance * 3000;
                else if (symbol === 'BNB') usdValue = balance * 600;
                else if (symbol === 'POL') usdValue = balance * 0.7;
                else usdValue = balance * (chain.toLowerCase().includes('sepolia') ? 100 : 0.5); // Fallback testnet vs mainnet

                allTokens.push({
                  symbol,
                  chain,
                  balance,
                  usdValue
                });
              }
            } catch (error) {
              console.error(`Error fetching metadata for token ${token.contractAddress}:`, error);
            }
          }));
        } catch (error) {
          console.error(`Error scanning chain ${chain}:`, error);
        }
      })
    );

    // 5. Anti-Spam Filter & Optimization
    const spamKeywords = ['CLAIM', 'ACCESS', 'FREE', 'LINK', '.APP', 'AIRDROP', 'GIFT'];

    let filteredTokens = allTokens.filter(t => {
      const isSpam = spamKeywords.some(key => t.symbol.toUpperCase().includes(key));
      const isTestnet = t.chain.toLowerCase().includes('sepolia');
      return !isSpam && (isTestnet ? t.balance > 0 : t.usdValue > 0.1);
    });

    // Urutkan berdasarkan nilai USD tertinggi
    filteredTokens.sort((a, b) => b.usdValue - a.usdValue);

    // Ambil Top 8 saja agar UI tetap bersih
    const topTokens = filteredTokens.slice(0, 8);

    return topTokens;
  }
}
