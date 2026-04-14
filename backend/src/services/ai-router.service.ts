import { Injectable } from '@nestjs/common';
import { TokenBalance } from './wallet-scanner.service';

export interface RouteData {
  token: string;
  chain: string;
  gasEstimateIdr: number;
  score: number;
  reasoning: string;
}

@Injectable()
export class AiRouterService {
  // Estimasi standar kecepatan konfirmasi block (dalam detik)
  private readonly SPEEDS = {
    'Base': 2,
    'Polygon': 2,
    'BSC': 3,
    'Arbitrum': 2,
    'Ethereum': 12,
  };

  /**
   * 1. Fungsi getGasPrices()
   * Fetch gas price real-time (Untuk MVP Hackathon menggunakan baseline mock karena rate-limit API gratis)
   */
  async getGasPrices(): Promise<Record<string, number>> {
    // Implementasi nyata: fetch ke basescan.org/api, polygonscan.com/api, dll.
    return {
      'Base': 50,      // ~ Rp 50
      'Polygon': 150,  // ~ Rp 150
      'Arbitrum': 80,  // ~ Rp 80
      'BSC': 300,      // ~ Rp 300
      'Ethereum': 45000 // ~ Rp 45000
    };
  }

  /**
   * 2. Fungsi calculateScore(token, chain, gasPrice, speed)
   */
  calculateScore(token: string, chain: string, gasPrice: number, speed: number): number {
    // Asumsi biaya gas tertinggi yg ditoleransi = Rp 50.000
    const gasEfficiency = Math.max(0, 1 - (gasPrice / 50000));
    
    // Asumsi speed paling lambat yg ditoleransi = 15 detik
    const speedScore = Math.max(0, 1 - (speed / 15));
    
    // Stable Bonus: USDC/USDT adalah settlement ideal untuk payment (skor 1.0)
    const stableBonus = (token === 'USDC' || token === 'USDT') ? 1.0 : 0.2;
    
    // Liquidity score default 1.0 untuk token-token dominan
    const liquidityScore = 1.0;

    // Formula komposit dari PRD
    const score = (0.4 * gasEfficiency) + (0.3 * speedScore) + (0.2 * stableBonus) + (0.1 * liquidityScore);
    
    return score;
  }

  /**
   * 3. Fungsi findOptimalRoute(walletTokens, amountIDR)
   */
  async findOptimalRoute(walletTokens: TokenBalance[], amountIDR: number): Promise<RouteData | null> {
    // Filter token yang balance cukup dengan buffer 5%
    const minRequired = amountIDR * 1.05; 
    const eligibleTokens = walletTokens.filter(t => t.usdValue >= minRequired);

    if (eligibleTokens.length === 0) {
      return null;
    }

    const gasPrices = await this.getGasPrices();
    
    let bestRoute: RouteData | null = null;
    let highestScore = -1;

    for (const token of eligibleTokens) {
      const gPrice = gasPrices[token.chain] || 50000;
      const speed = this.SPEEDS[token.chain as keyof typeof this.SPEEDS] || 15;
      
      const score = this.calculateScore(token.symbol, token.chain, gPrice, speed);
      
      if (score > highestScore) {
        highestScore = score;
        bestRoute = {
          token: token.symbol,
          chain: token.chain,
          gasEstimateIdr: gPrice,
          score: score,
          reasoning: `Skor: ${score.toFixed(2)}. ${token.symbol} / ${token.chain} dipilih karena gas fee rendah dan konversi stabil.`
        };
      }
    }

    return bestRoute;
  }
}
