import { Injectable } from '@nestjs/common';
import { TokenBalance } from './wallet-scanner.service';
import { CurrencyService } from './currency.service';
import { CHAIN_CONFIG } from '../config/chains';

export interface RouteData {
  token: string;
  chain: string;
  gasEstimateIdr: number;
  amountToken: number;
  score: number;
  reasoning: string;
}

export interface RouteCandidate {
  token: string;
  chain: string;
  gasEstimateIdr: number;
  amountToken: number;
  score: number;
  // Score breakdown per component — visible to frontend for AI decision matrix
  gasEfficiency: number;
  speedScore: number;
  stableBonus: number;
  liquidityScore: number;
}

export interface RouteResult {
  best: RouteData;
  candidates: RouteCandidate[];
}

@Injectable()
export class AiRouterService {
  private readonly alchemyKey: string;
  private readonly GAS_LIMIT = 100_000;

  constructor(private readonly currencyService: CurrencyService) {
    this.alchemyKey = process.env.ALCHEMY_API_KEY || '';
  }

  // Estimasi standar kecepatan konfirmasi block (dalam detik)
  private readonly SPEEDS = {
    'Base': 2,
    'Base Sepolia': 2,
    'Polygon': 2,
    'BSC': 3,
    'Arbitrum': 2,
    'Ethereum': 12,
  };

  /**
   * 1. Fungsi getGasPrices()
   * Fetch gas price real-time from Alchemy RPC
   */
  async getGasPrices(): Promise<Record<string, number>> {
    const chains = Object.keys(CHAIN_CONFIG);
    const coingeckoIds = Array.from(new Set(chains.map(c => CHAIN_CONFIG[c].coingeckoId)));
    
    // Fetch token prices & exchange rates
    const [tokenPrices, idrRates] = await Promise.all([
      this.currencyService.getTokenPrices(coingeckoIds),
      this.currencyService.getLatestRates()
    ]);
    const idrRate = idrRates['IDR'] || 16000;

    const results: Record<string, number> = {};

    // Fetch gas prices from Alchemy in parallel
    await Promise.all(chains.map(async (chainName) => {
      try {
        const config = CHAIN_CONFIG[chainName];
        const url = `https://${config.network}.g.alchemy.com/v2/${this.alchemyKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_gasPrice',
            params: [],
          }),
        });
        
        if (!response.ok) {
          const text = await response.text();
          console.error(`Alchemy RPC HTTP Error [${chainName}]: ${response.status} - ${text.substring(0, 100)}`);
          throw new Error(`RPC_HTTP_ERROR: ${response.status}`);
        }

        const data = await response.json();
        const gasPriceWei = BigInt(data.result || '0');
        const gasPriceEth = Number(gasPriceWei) / 1e18;
        
        // Fee = GasPrice * GasLimit
        const feeEth = gasPriceEth * this.GAS_LIMIT;
        
        // Convert to IDR: Eth * TokenPrice(USD) * IDR_Rate
        const tokenPriceUsd = tokenPrices[config.coingeckoId] || 0;
        const feeIdr = feeEth * tokenPriceUsd * idrRate;
        
        // Tambahkan buffer 20% untuk safety di UI
        results[chainName] = Math.round(feeIdr * 1.2);
      } catch (error) {
        console.error(`Error fetching gas price for ${chainName}:`, error);
        results[chainName] = chainName === 'Ethereum' ? 50000 : 500; // Realistic defaults
      }
    }));

    // Support BSC as mock because Alchemy doesn't support it for free
    if (!results['BSC']) results['BSC'] = 300;

    return results;
  }

  /**
   * 2. Fungsi calculateScore(token, chain, gasPrice, speed)
   * Returns composite score AND per-component breakdown for AI decision transparency
   */
  calculateScore(token: string, chain: string, gasPrice: number, speed: number): {
    total: number;
    gasEfficiency: number;
    speedScore: number;
    stableBonus: number;
    liquidityScore: number;
  } {
    // Asumsi biaya gas tertinggi yg ditoleransi = Rp 50.000
    const gasEfficiency = Math.max(0, 1 - (gasPrice / 50000));
    
    // Asumsi speed paling lambat yg ditoleransi = 15 detik
    const speedScore = Math.max(0, 1 - (speed / 15));
    
    // Stable Bonus: USDC/USDT adalah settlement ideal untuk payment (skor 1.0)
    const stableBonus = (token === 'USDC' || token === 'USDT') ? 1.0 : 0.2;
    
    // Liquidity score default 1.0 untuk token-token dominan
    const liquidityScore = 1.0;

    // Formula komposit: weighted multi-variable optimization
    const total = (0.4 * gasEfficiency) + (0.3 * speedScore) + (0.2 * stableBonus) + (0.1 * liquidityScore);
    
    return { total, gasEfficiency, speedScore, stableBonus, liquidityScore };
  }

  /**
   * 3. Fungsi findOptimalRoute(walletTokens, amount, currency)
   * Returns the best route AND all evaluated candidates with score breakdowns
   */
  async findOptimalRoute(walletTokens: TokenBalance[], amount: number, currency: string = 'IDR'): Promise<RouteResult | null> {
    // KONVERSI MATA UANG KE USD
    const amountUSD = await this.currencyService.convertToUSD(amount, currency);
    
    // Filter token yang balance cukup dengan buffer 5%
    const minRequiredUSD = amountUSD * 1.05; 
    const eligibleTokens = walletTokens.filter(t => t.usdValue >= minRequiredUSD);

    if (eligibleTokens.length === 0) {
      return null;
    }

    const gasPrices = await this.getGasPrices();
    const idrRates = await this.currencyService.getLatestRates();
    const idrRate = idrRates['IDR'] || 16000;
    
    // Fetch token prices for all possibly best tokens
    const coingeckoIds = Array.from(new Set(eligibleTokens.map(t => CHAIN_CONFIG[t.chain].coingeckoId)));
    const tokenPricesUsd = await this.currencyService.getTokenPrices(coingeckoIds);
    
    // Evaluate ALL candidates with full score breakdown
    const candidates: RouteCandidate[] = [];

    for (const token of eligibleTokens) {
      const gPrice = gasPrices[token.chain] || 50000;
      const speed = this.SPEEDS[token.chain as keyof typeof this.SPEEDS] || 15;
      
      const config = CHAIN_CONFIG[token.chain];
      const tokenPriceUsd = tokenPricesUsd[config.coingeckoId] || 3500;
      
      // Hitung amountToken: (IDR / IDR_per_USD) / USD_per_Token
      const amountToken = (amount / idrRate) / tokenPriceUsd;

      const scoreResult = this.calculateScore(token.symbol, token.chain, gPrice, speed);
      
      candidates.push({
        token: token.symbol,
        chain: token.chain,
        gasEstimateIdr: gPrice,
        amountToken: Number(amountToken.toFixed(8)),
        score: scoreResult.total,
        gasEfficiency: scoreResult.gasEfficiency,
        speedScore: scoreResult.speedScore,
        stableBonus: scoreResult.stableBonus,
        liquidityScore: scoreResult.liquidityScore,
      });
    }

    // Sort by score descending — best route first
    candidates.sort((a, b) => b.score - a.score);

    const winner = candidates[0];
    const best: RouteData = {
      token: winner.token,
      chain: winner.chain,
      gasEstimateIdr: winner.gasEstimateIdr,
      amountToken: winner.amountToken,
      score: winner.score,
      reasoning: `Skor efisiensi: ${(winner.score * 100).toFixed(0)}%. ${winner.token} di ${winner.chain} dipilih dari ${candidates.length} rute yang dievaluasi.`,
    };

    return { best, candidates };
  }
}
