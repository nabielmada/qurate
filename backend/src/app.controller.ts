import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { WalletScannerService, TokenBalance } from './services/wallet-scanner.service';
import { AiRouterService, RouteData } from './services/ai-router.service';
import { AiExplainerService } from './services/ai-explainer.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly walletScanner: WalletScannerService,
    private readonly aiRouter: AiRouterService,
    private readonly aiExplainer: AiExplainerService,
  ) {}

  @Get('scan/:address')
  async scanWallet(@Param('address') address: string): Promise<TokenBalance[]> {
    return this.walletScanner.scanWallet(address);
  }

  @Post('route')
  async findRoute(@Body() body: { tokens: TokenBalance[], amountIDR: number }): Promise<{ data: RouteData | null }> {
    const route = await this.aiRouter.findOptimalRoute(body.tokens, body.amountIDR);
    return { data: route };
  }

  @Post('explain')
  async explainRoute(@Body() body: { routeData: RouteData, merchantName: string, amountIDR: number }): Promise<{ explanation: string }> {
    const explanation = await this.aiExplainer.explainDecision(body.routeData, body.merchantName, body.amountIDR);
    return { explanation };
  }
}
