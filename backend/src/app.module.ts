import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletScannerService } from './services/wallet-scanner.service';
import { AiRouterService } from './services/ai-router.service';
import { AiExplainerService } from './services/ai-explainer.service';
import { CurrencyService } from './services/currency.service';
import { MerchantService } from './services/merchant.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    WalletScannerService,
    AiRouterService,
    AiExplainerService,
    CurrencyService,
    MerchantService,
  ],
})
export class AppModule {}
