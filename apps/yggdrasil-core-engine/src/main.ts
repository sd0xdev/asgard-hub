/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const grpcHost = process.env.GRPC_HOST || 'localhost';
const grpcPort = {
  chatgpt: 5000,
  llmai: 5001,
};

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  await setupMicroservice(app);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

async function setupMicroservice(app: NestApplication) {
  const gRCPPackages = ['chatgpt', 'llmai'];
  gRCPPackages.forEach((pkg) => {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: pkg,
        protoPath: join(__dirname, `assets/${pkg}/proto/${pkg}.proto`),
        url: `${grpcHost}:${grpcPort[pkg]}`,
      },
    });
  });
  await app.startAllMicroservices();
  Logger.log(
    `🚀 gRPC server is running on: ${grpcHost}: ${gRCPPackages
      .map((pkg) => `${pkg}:${grpcPort[pkg]}`)
      .join(',')}`
  );
}

bootstrap();
