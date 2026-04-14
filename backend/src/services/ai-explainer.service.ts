import { Injectable } from '@nestjs/common';
import { RouteData } from './ai-router.service';
import { GoogleGenAI } from '@google/genai';
import { CurrencyService } from './currency.service';

@Injectable()
export class AiExplainerService {
  private readonly client: any = null;

  constructor(private readonly currencyService: CurrencyService) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Panggil Google Gemini API
   * Generate human-readable reasoning
   */
  async explainDecision(routeData: RouteData, merchantName: string, amount: number, currency: string = 'IDR'): Promise<string> {
    const symbol = this.currencyService.getSymbol(currency);
    
    if (!this.client) {
      console.warn('GEMINI_API_KEY tidak dikonfigurasi. Menggunakan fallback lokal.');
      return `Saya merekomendasikan menggunakan ${routeData.token} di jaringan ${routeData.chain}. Biayanya sangat murah dan prosesnya cepat!`;
    }

    try {
      const prompt = `
        Konteks: Aplikasi Pembayaran Web3 bernama Qurate AI.
        Tugas: Jelaskan mengapa AI memilih rute pembayaran ini kepada pengguna awam.
        
        Data Transaksi:
        - Pelanggan membayar ${symbol} ${amount.toLocaleString()} ke merchant "${merchantName}".
        - Strategi terpilih: Token ${routeData.token} di network ${routeData.chain}.
        - Estimasi biaya admin/gas (dalam IDR): Rp ${routeData.gasEstimateIdr.toLocaleString('id-ID')}.
        - Skor efisiensi AI: ${(routeData.score * 100).toFixed(0)}%.
        
        Instruksi:
        1. Gunakan Bahasa Indonesia yang ramah (human-first).
        2. Maksimal 2-3 kalimat.
        3. Fokus pada penghematan biaya dan kecepatan.
        4. Jangan gunakan istilah teknis (gas, chain, liquidity).
        5. Jangan beri salam pembuka.
      `;

      // Menggunakan model gemini-1.5-flash untuk stabilitas lebih baik
      const response = await this.client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      let text = response.text || '';
      text = text.trim().replace(/^["']|["']$/g, '');

      return text;
    } catch (e) {
      console.error('Kendala saat menghubungi Gemini API:', e);
      return `Opsi pembayaran terbaik saat ini adalah menggunakan ${routeData.token} via jaringan ${routeData.chain}.`;
    }
  }
}
