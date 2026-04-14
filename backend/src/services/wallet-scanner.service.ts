import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CHAIN_CONFIG } from '../config/chains';

export interface TokenBalance {
  symbol: string;
  chain: string;
  balance: number;
  usdValue: number;
}

@Injectable()
export class WalletScannerService {
  private readonly apiKey: string;

  constructor(private readonly currencyService: CurrencyService) {
    this.apiKey = process.env.ALCHEMY_API_KEY || '';
  }

  async scanWallet(walletAddress: string): Promise<TokenBalance[]> {
    // 1. Khusus untuk Guest Mode (Demo)
    if (walletAddress === '0xGUEST') {
      return [
        { symbol: 'ETH', chain: 'Ethereum', balance: 0.1245, usdValue: 435.75 },
        { symbol: 'POL', chain: 'Polygon', balance: 850.00, usdValue: 595.00 },
        { symbol: 'USDC', chain: 'Base', balance: 250.00, usdValue: 250.00 },
        { symbol: 'ETH', chain: 'Base Sepolia', balance: 0.045, usdValue: 157.50 },
        { symbol: 'ARB', chain: 'Arbitrum', balance: 120.50, usdValue: 120.50 },
      ];
    }

    // 2. Terima wallet address & error handling
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new HttpException('Format wallet address tidak valid', HttpStatus.BAD_REQUEST);
    }

    if (!this.apiKey) {
      console.warn('ALCHEMY_API_KEY belum dikonfigurasi di .env!');
    }

    const allTokens: TokenBalance[] = [];
    const chains = Object.keys(CHAIN_CONFIG);
    const coingeckoIds = Array.from(new Set(chains.map(c => CHAIN_CONFIG[c].coingeckoId)));
    
    // Fetch real-time prices
    const tokenPrices = await this.currencyService.getTokenPrices(coingeckoIds);

    // 2. Fetch ke semua chain secara paralel
    await Promise.all(
      chains.map(async (chain) => {
        try {
          const config = CHAIN_CONFIG[chain];
          const url = `https://${config.network}.g.alchemy.com/v2/${this.apiKey}`;

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
              const symbol = config.nativeSymbol;
              const priceUsd = tokenPrices[config.coingeckoId] || 3500;
              allTokens.push({
                symbol,
                chain,
                balance,
                usdValue: balance * priceUsd
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

                // Kalkulasi usdValue
                let usdValue = 0;
                const upperSymbol = symbol.toUpperCase();
                
                if (upperSymbol === 'USDC' || upperSymbol === 'USDT' || upperSymbol === 'DAI') {
                  usdValue = balance;
                } else if (upperSymbol === config.nativeSymbol) {
                  usdValue = balance * (tokenPrices[config.coingeckoId] || 3500);
                } else {
                  usdValue = balance * (chain.toLowerCase().includes('sepolia') ? 10 : 0.5);
                }

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
