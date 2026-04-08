import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validación global con class-validator
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors();

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Laundry API running on port ${port}`);
}
bootstrap();
