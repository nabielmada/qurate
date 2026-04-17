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
   * @dev Google Gemini 1.5/2.0 Flash Integration
   * Logic: Generates human-readable COMPARATIVE reasoning.
   * Unlike standard narrators, this explains the 'Winning Route' vs 'Rejected Routes' 
   * to build trust through transparency.
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
      console.warn('GEMINI_API_KEY not configured. Using local fallback.');
      return `I recommend using ${routeData.token} on the ${routeData.chain} network. The fees are extremely low and the process is fast!`;
    }

    try {
      // Build comparative route table for Gemini
      const formatVal = (v: number) => {
        return v.toLocaleString('en-US', {
          maximumFractionDigits: currency === 'IDR' ? 0 : 2,
          minimumFractionDigits: currency === 'IDR' ? 0 : 2
        });
      };

      let routeComparisonBlock = '';
      if (candidates.length > 1) {
        const routeLines = candidates.map((c, i) => {
          const tag = i === 0 ? '(SELECTED ✓)' : `(Alternative ${i})`;
          return `  - Route ${i + 1} ${tag}: ${c.token} / ${c.chain} — Fee ${symbol} ${formatVal(c.gasEstimateIdr)}, Score ${(c.score * 100).toFixed(0)}%`;
        }).join('\n');
        routeComparisonBlock = `
        All AI Evaluated Routes (${candidates.length} routes):
${routeLines}
        `;
      }

      const prompt = `
        Context: A Web3 Payment Application called Qurate AI.
        Task: Explain why the AI chose this specific payment route to a non-technical user. Compare it with other evaluated routes.
        
        Transaction Data:
        - Customer is paying ${symbol} ${formatVal(amount)} to merchant "${merchantName}".
        - Selected strategy: ${routeData.token} token on ${routeData.chain} network.
        - Estimated transaction/gas fees: ${symbol} ${formatVal(routeData.gasEstimateIdr)}.
        - AI efficiency score: ${(routeData.score * 100).toFixed(0)}%.
        ${routeComparisonBlock}
        Instructions:
        1. Use friendly, human-first English.
        2. Maximum 3-4 sentences.
        3. Explain WHY this route was chosen AND why others were rejected (mention fee/speed comparison).
        4. Avoid technical jargon (gas, chain, liquidity, score). Use simple words like "transaction fees", "digital path", "network costs".
        5. Do not include introductory greetings.
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
      console.error('Error contacting Gemini API:', e);
      return `The best payment option currently is using ${routeData.token} via the ${routeData.chain} network. Selected from ${candidates.length} evaluated routes.`;
    }
  }
}
