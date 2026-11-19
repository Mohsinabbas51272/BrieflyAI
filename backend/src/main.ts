import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('BrieflyAI-Bootstrap');

  // Prefix all routes with /api
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: true, // Allow frontend dev server
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Enable Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`BrieflyAI Backend running on: http://localhost:${port}/api`);
}

bootstrap();
