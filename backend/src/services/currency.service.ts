import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private rates: Record<string, number> = {
    USD: 1,
    IDR: 16000,
    MYR: 4.7,
    SGD: 1.35,
    EUR: 0.94,
  };
  private tokenPrices: Record<string, number> = {
    ethereum: 3500,
    'matic-network': 0.7,
    binancecoin: 600,
  };
  private lastUpdate = 0;
  private lastTokenUpdate = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 menit

  async getLatestRates(): Promise<Record<string, number>> {
    const now = Date.now();
    if (now - this.lastUpdate < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      console.log('🔄 Fetching latest exchange rates from Frankfurter...');
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      const data = await response.json();
      
      if (data && data.rates) {
        this.rates = {
          USD: 1,
          ...data.rates,
        };
        this.lastUpdate = now;
        console.log('✅ Exchange rates updated successfully.');
      }
    } catch (error) {
      console.error('❌ Failed to fetch exchange rates, using fallback:', error);
    }

    return this.rates;
  }

  async getTokenPrices(ids: string[]): Promise<Record<string, number>> {
    const now = Date.now();
    if (now - this.lastTokenUpdate < this.CACHE_DURATION && ids.every(id => this.tokenPrices[id] !== undefined)) {
      return this.tokenPrices;
    }

    try {
      const idsQuery = ids.join(',');
      console.log(`🔄 Fetching token prices for ${idsQuery} from CoinGecko...`);
      // Use the free simple price endpoint
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsQuery}&vs_currencies=usd`);
      const data = await response.json();

      if (data) {
        for (const id of ids) {
          if (data[id] && data[id].usd) {
            this.tokenPrices[id] = data[id].usd;
          }
        }
        this.lastTokenUpdate = now;
        console.log('✅ Token prices updated successfully.');
      }
    } catch (error) {
      console.error('❌ Failed to fetch token prices, using fallback:', error);
    }

    return this.tokenPrices;
  }

  async convertToUSD(amount: number, fromCurrency: string): Promise<number> {
    const rates = await this.getLatestRates();
    const rate = rates[fromCurrency.toUpperCase()];
    
    if (!rate) {
      console.warn(`⚠️ Rate for ${fromCurrency} not found, assuming 1:1 or fallback.`);
      return amount; // Default or handle error
    }

    return amount / rate;
  }

  async convertFromUSD(amountUSD: number, toCurrency: string): Promise<number> {
    const rates = await this.getLatestRates();
    const rate = rates[toCurrency.toUpperCase()];
    
    if (!rate) return amountUSD;
    
    return amountUSD * rate;
  }

  getSymbol(currency: string): string {
    const symbols: Record<string, string> = {
      IDR: 'Rp',
      USD: '$',
      MYR: 'RM',
      SGD: 'S$',
      EUR: '€',
    };
    return symbols[currency.toUpperCase()] || currency;
  }
}
