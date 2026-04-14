import { Injectable } from '@nestjs/common';
import { RouteData } from './ai-router.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiExplainerService {
  private readonly client: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      // Menggunakan SDK terbaru @google/genai
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Panggil Google Gemini API v2.5
   * Generate human-readable reasoning
   */
  async explainDecision(routeData: RouteData, merchantName: string, amountIDR: number): Promise<string> {
    if (!this.client) {
      console.warn('GEMINI_API_KEY tidak dikonfigurasi. Menggunakan fallback lokal.');
      return `Saya merekomendasikan menggunakan ${routeData.token} di jaringan ${routeData.chain}. Biayanya sangat murah dan prosesnya cepat!`;
    }

    try {
      const prompt = `
        Konteks: Aplikasi Pembayaran Web3 bernama PayAI.
        Tugas: Jelaskan mengapa AI memilih rute pembayaran ini kepada pengguna awam.
        
        Data Transaksi:
        - Pelanggan membayar Rp ${amountIDR.toLocaleString('id-ID')} ke merchant "${merchantName}".
        - Strategi terpilih: Token ${routeData.token} di network ${routeData.chain}.
        - Estimasi biaya admin/gas: Rp ${routeData.gasEstimateIdr.toLocaleString('id-ID')}.
        - Skor efisiensi AI: ${(routeData.score * 100).toFixed(0)}%.
        
        Instruksi:
        1. Gunakan Bahasa Indonesia yang ramah (human-first).
        2. Maksimal 2-3 kalimat.
        3. Fokus pada penghematan biaya dan kecepatan.
        4. Jangan gunakan istilah teknis (gas, chain, liquidity).
        5. Jangan beri salam pembuka.
      `;

      // Menggunakan model gemini-2.5-flash sesuai instruksi user
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      let text = response.text || '';
      
      // Bersihkan jika ada tanda kutip
      text = text.trim().replace(/^["']|["']$/g, '');

      return text;
    } catch (e) {
      console.error('Kendala saat menghubungi Gemini 2.5 API:', e);
      return `Opsi pembayaran terbaik saat ini adalah menggunakan ${routeData.token} via jaringan ${routeData.chain}.`;
    }
  }
}
