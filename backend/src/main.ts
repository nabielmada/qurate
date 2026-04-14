import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Next.js uses 3000 by default, so we use 3001 for the backend.
  // Alternatively fallback to another port.
  app.enableCors(); // Also enable CORS since frontend is on a different port
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
