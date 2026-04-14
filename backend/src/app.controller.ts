import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { WalletScannerService, TokenBalance } from './services/wallet-scanner.service';
import { AiRouterService, RouteData } from './services/ai-router.service';
import { AiExplainerService } from './services/ai-explainer.service';
import { CurrencyService } from './services/currency.service';
import { MerchantService } from './services/merchant.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly walletScanner: WalletScannerService,
    private readonly aiRouter: AiRouterService,
    private readonly aiExplainer: AiExplainerService,
    private readonly currencyService: CurrencyService,
    private readonly merchantService: MerchantService,
  ) {}

  @Get('scan/:address')
  async scanWallet(@Param('address') address: string): Promise<TokenBalance[]> {
    return this.walletScanner.scanWallet(address);
  }

  @Post('route')
  async findRoute(@Body() body: { tokens: TokenBalance[], amount: number, currency: string }): Promise<{ data: RouteData | null }> {
    const route = await this.aiRouter.findOptimalRoute(body.tokens, body.amount, body.currency);
    return { data: route };
  }

  @Post('explain')
  async explainRoute(@Body() body: { routeData: RouteData, merchantName: string, amount: number, currency: string }): Promise<{ explanation: string }> {
    const explanation = await this.aiExplainer.explainDecision(body.routeData, body.merchantName, body.amount, body.currency);
    return { explanation };
  }

  @Get('rates')
  async getRates(): Promise<Record<string, number>> {
    return this.currencyService.getLatestRates();
  }

  @Get('gas-prices')
  async getGasPrices(): Promise<Record<string, number>> {
    return this.aiRouter.getGasPrices();
  }

  @Get('merchants/:id')
  async getMerchant(@Param('id') id: string) {
    const merchant = await this.merchantService.getMerchantById(id);
    if (!merchant) {
      return { success: false, message: 'Merchant not found' };
    }
    return { success: true, merchant };
  }
}
