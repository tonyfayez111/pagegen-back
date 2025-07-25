import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

function logRoutes(app: INestApplication) {
  const httpAdapter = app.getHttpAdapter();
  const router = httpAdapter.getInstance();

  if (!router || !router._router || !Array.isArray(router._router.stack)) {
    console.warn('⚠️ Route logging skipped: router not found or not using Express.');
    return;
  }

  const routes: { method: string; path: string }[] = [];

  router._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      routes.push({ method: methods, path: middleware.route.path });
    } else if (middleware.name === 'router' && middleware.handle?.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          routes.push({ method: methods, path: handler.route.path });
        }
      });
    }
  });

  console.table(routes);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  // === Swagger Setup ===
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Access via /api

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // === Route Logging (Safe for Express) ===
  logRoutes(app);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api`);
}
bootstrap();
