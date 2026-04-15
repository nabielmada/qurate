import { Injectable } from '@nestjs/common';
import { RouteData, RouteCandidate } from './ai-router.service';
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
   * Generate human-readable COMPARATIVE reasoning — explain why winner was chosen
   * AND why other routes were rejected
   */
  async explainDecision(
    routeData: RouteData,
    merchantName: string,
    amount: number,
    currency: string = 'IDR',
    candidates: RouteCandidate[] = [],
  ): Promise<string> {
    const symbol = this.currencyService.getSymbol(currency);

    if (!this.client) {
      console.warn('GEMINI_API_KEY tidak dikonfigurasi. Menggunakan fallback lokal.');
      return `Saya merekomendasikan menggunakan ${routeData.token} di jaringan ${routeData.chain}. Biayanya sangat murah dan prosesnya cepat!`;
    }

    try {
      // Build comparative route table for Gemini
      const formatVal = (v: number) => {
        return v.toLocaleString(currency === 'IDR' ? 'id-ID' : 'en-US', {
          maximumFractionDigits: currency === 'IDR' ? 0 : 2,
          minimumFractionDigits: currency === 'IDR' ? 0 : 2
        });
      };

      let routeComparisonBlock = '';
      if (candidates.length > 1) {
        const routeLines = candidates.map((c, i) => {
          const tag = i === 0 ? '(DIPILIH ✓)' : `(Alternatif ${i})`;
          return `  - Rute ${i + 1} ${tag}: ${c.token} / ${c.chain} — Biaya ${symbol} ${formatVal(c.gasEstimateIdr)}, Skor ${(c.score * 100).toFixed(0)}%`;
        }).join('\n');
        routeComparisonBlock = `
        Semua Rute yang Dievaluasi AI (${candidates.length} rute):
${routeLines}
        `;
      }

      const prompt = `
        Konteks: Aplikasi Pembayaran Web3 bernama Qurate AI.
        Tugas: Jelaskan mengapa AI memilih rute pembayaran ini kepada pengguna awam. Bandingkan dengan rute lain yang dievaluasi.
        
        Data Transaksi:
        - Pelanggan membayar ${symbol} ${formatVal(amount)} ke merchant "${merchantName}".
        - Strategi terpilih: Token ${routeData.token} di network ${routeData.chain}.
        - Estimasi biaya admin/gas: ${symbol} ${formatVal(routeData.gasEstimateIdr)}.
        - Skor efisiensi AI: ${(routeData.score * 100).toFixed(0)}%.
        ${routeComparisonBlock}
        Instruksi:
        1. Gunakan Bahasa Indonesia yang ramah (human-first).
        2. Maksimal 3-4 kalimat.
        3. Jelaskan MENGAPA rute ini dipilih DAN mengapa rute lain tidak dipilih (sebutkan perbandingan biaya/kecepatan).
        4. Jangan gunakan istilah teknis (gas, chain, liquidity, score). Ganti dengan kata sederhana seperti "biaya admin", "jalur", "tabungan digital".
        5. Jangan beri salam pembuka.
      `;

      // Using gemini-2.0-flash (current stable model)
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      let text = response.text || '';
      text = text.trim().replace(/^["']|["']$/g, '');

      return text;
    } catch (e) {
      console.error('Kendala saat menghubungi Gemini API:', e);
      return `Opsi pembayaran terbaik saat ini adalah menggunakan ${routeData.token} via jaringan ${routeData.chain}. Dipilih dari ${candidates.length} rute yang dievaluasi.`;
    }
  }
}
