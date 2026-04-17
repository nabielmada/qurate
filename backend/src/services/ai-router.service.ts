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

  // Cache gas prices for 30s to avoid Alchemy 429s from double-calls
  // (frontend calls /gas-prices and /route separately, both need gas data)
  private gasPriceCache = new Map<string, { data: Record<string, number>; expiresAt: number }>();
  private readonly GAS_CACHE_TTL_MS = 30_000;

  constructor(private readonly currencyService: CurrencyService) {
    this.alchemyKey = process.env.ALCHEMY_API_KEY || '';
  }

  // Estimated standard block confirmation speed (in seconds)
  private readonly SPEEDS = {
    'Base': 2,
    'Base Sepolia': 2,
    'Polygon': 2,
    'BSC': 3,
    'Arbitrum': 2,
    'Ethereum': 12,
  };

  /**
   * 1. getGasPrices() method
   * Fetch real-time gas prices from Alchemy RPC
   * Returns gas fee in the requested target currency
   */
  async getGasPrices(targetCurrency: string = 'USD'): Promise<Record<string, number>> {
    // Return cached result if still fresh
    const cacheHit = this.gasPriceCache.get(targetCurrency);
    if (cacheHit && cacheHit.expiresAt > Date.now()) {
      return cacheHit.data;
    }

    const chains = Object.keys(CHAIN_CONFIG);
    const coingeckoIds = Array.from(new Set(chains.map(c => CHAIN_CONFIG[c].coingeckoId)));
    
    // Fetch token prices & exchange rates
    const [tokenPrices, idrRates] = await Promise.all([
      this.currencyService.getTokenPrices(coingeckoIds),
      this.currencyService.getLatestRates()
    ]);
    
    const targetRate = idrRates[targetCurrency.toUpperCase()] || 1;

    const results: Record<string, number> = {};

    // Fetch gas prices from Alchemy in parallel (skip disabled chains)
    await Promise.all(chains.map(async (chainName) => {
      const config = CHAIN_CONFIG[chainName];

      // Skip chains not enabled on this Alchemy key — use static fallback directly
      if (!config.enabled) {
        const defaultUsd = chainName === 'Ethereum' ? 2.5 : 0.08;
        results[chainName] = defaultUsd * targetRate;
        return;
      }

      try {
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
        if (!data.result || data.result === '0x0' || data.error) {
          throw new Error(`INVALID_GAS_RESPONSE: ${JSON.stringify(data.error || 'null result')}`);
        }
        const gasPriceWei = BigInt(data.result);
        const gasPriceEth = Number(gasPriceWei) / 1e18;
        
        // Fee = GasPrice * GasLimit
        const feeEth = gasPriceEth * this.GAS_LIMIT;
        
        // Convert to target currency: Eth * TokenPrice(USD) * targetRate
        const tokenPriceUsd = tokenPrices[config.coingeckoId] || 0;
        const rawFeeUsd = feeEth * tokenPriceUsd;

        // Apply practical minimum floor — real Base gas can be ~$0.0004,
        // which would display as "$0.00". Floor ensures always-meaningful display.
        const minFeeUsd = chainName === 'Ethereum' ? 1.5 : 0.05;
        const effectiveFeeUsd = Math.max(rawFeeUsd, minFeeUsd);

        // Add 20% buffer for safety, then convert to target currency
        results[chainName] = effectiveFeeUsd * 1.2 * targetRate;
      } catch (error) {
        console.error(`Error fetching gas price for ${chainName}:`, error);
        // Realistic fallback defaults in USD then convert
        const defaultUsd = chainName === 'Ethereum' ? 2.5 : 0.05;
        results[chainName] = defaultUsd * targetRate;
      }
    }));

    // Support BSC as mock
    if (!results['BSC']) {
      results['BSC'] = 0.02 * targetRate;
    }

    // Store in cache
    this.gasPriceCache.set(targetCurrency, { data: results, expiresAt: Date.now() + this.GAS_CACHE_TTL_MS });

    return results;
  }

  /**
   * 2. Fungsi calculateScore(token, chain, gasPrice, speed)
   * Returns composite score AND per-component breakdown for AI decision transparency
   */
  calculateScore(token: string, chain: string, gasPriceUsd: number, speed: number): {
    total: number;
    gasEfficiency: number;
    speedScore: number;
    stableBonus: number;
    liquidityScore: number;
  } {
    /**
     * @dev Composite Scoring Algorithm: Multi-variable optimization
     * Weights: Gas (40%), Speed (30%), Stability (20%), Liquidity (10%)
     * Normalizes heterogeneous chain data into a unified Decision Matrix.
     */
    const gasEfficiency = Math.max(0, 1 - (gasPriceUsd / 2.0)); // Threshold: $2.00 is high-risk/premium
    
    const speedScore = Math.max(0, 1 - (speed / 15)); // Tolerance: 15s max for retail POS scenarios
    
    // Stable Bonus: Incentivizes low-volatility assets (USDC/USDT) for merchant settlement
    const stableBonus = (token === 'USDC' || token === 'USDT') ? 1.0 : 0.2;
    
    const liquidityScore = 1.0; // Default for major blue-chip tokens

    // Composite formula for AI route selection
    const total = (0.4 * gasEfficiency) + (0.3 * speedScore) + (0.2 * stableBonus) + (0.1 * liquidityScore);
    
    return { total, gasEfficiency, speedScore, stableBonus, liquidityScore };
  }

  /**
   * 3. findOptimalRoute(walletTokens, amount, currency) method
   * Returns the best route AND all evaluated candidates with score breakdowns
   */
  async findOptimalRoute(walletTokens: TokenBalance[], amount: number, currency: string = 'USD'): Promise<RouteResult | null> {
    // 1. Convert requested amount to USD pivot (IMPORTANT: Always calculate buffer in USD)
    const amountUSD = await this.currencyService.convertToUSD(amount, currency);
    const minRequiredUSD = amountUSD * 1.05; 
    
    // 2. Filter tokens with sufficient balance
    const eligibleTokens = walletTokens.filter(t => t.usdValue >= minRequiredUSD);

    if (eligibleTokens.length === 0) {
      return null;
    }

    // 3. Fetch gas data in the requested target currency
    const gasPricesTarget = await this.getGasPrices(currency);
    const idrRates = await this.currencyService.getLatestRates();
    const targetToUsdRate = 1 / (idrRates[currency.toUpperCase()] || 1);
    
    // Evaluate ALL candidates
    const candidates: RouteCandidate[] = [];

    for (const token of eligibleTokens) {
      const gPriceTarget = gasPricesTarget[token.chain] || (currency === 'USD' ? 0.05 : 500);
      const speed = this.SPEEDS[token.chain as keyof typeof this.SPEEDS] || 15;
      
      // Calculate Gas in USD for fair scoring
      const gPriceUsd = gPriceTarget * targetToUsdRate;

      // Calculate amountToken: USD_Amount / USD_per_Token
      const amountToken = amountUSD / token.priceUsd;

      // Scoring using USD base ($2.00 threshold)
      const scoreResult = this.calculateScore(token.symbol, token.chain, gPriceUsd, speed);
      
      candidates.push({
        token: token.symbol,
        chain: token.chain,
        gasEstimateIdr: gPriceTarget, // Kita pakai nama gasEstimateIdr tapi isinya adalah targetCurrency
        amountToken: Number(amountToken.toFixed(8)),
        score: scoreResult.total,
        gasEfficiency: scoreResult.gasEfficiency,
        speedScore: scoreResult.speedScore,
        stableBonus: scoreResult.stableBonus,
        liquidityScore: scoreResult.liquidityScore,
      });
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    const winner = candidates[0];
    const best: RouteData = {
      token: winner.token,
      chain: winner.chain,
      gasEstimateIdr: winner.gasEstimateIdr,
      amountToken: winner.amountToken,
      score: winner.score,
      reasoning: `Efficiency score: ${(winner.score * 100).toFixed(0)}%. ${winner.token} on ${winner.chain} selected because it provides best balance between gas and speed. Evaluated ${candidates.length} routes.`,
    };

    return { best, candidates };
  }
}
