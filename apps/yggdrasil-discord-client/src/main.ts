/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
const ENV = process.env.NODE_ENV || 'development';
console.log(
  `NODE_ENV: ${ENV}, Version: ${process.env.SERVER_VERSION ?? `Unknown`}`
);

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule, {
    cors: !(!ENV || ENV === 'development'),
  });

  await setupMicroservice(app);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
async function setupMicroservice(app: NestApplication) {
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });
  await app.startAllMicroservices();
  Logger.log(`🚀 Microservice is running`);
}

bootstrap();
