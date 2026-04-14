import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletScannerService } from './services/wallet-scanner.service';
import { AiRouterService } from './services/ai-router.service';
import { AiExplainerService } from './services/ai-explainer.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    WalletScannerService,
    AiRouterService,
    AiExplainerService,
  ],
})
export class AppModule {}
