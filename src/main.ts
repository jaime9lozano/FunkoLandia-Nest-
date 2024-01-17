import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import * as process from 'process';

async function bootstrap() {
  const keyPath = './cert/keystore.p12';
  const certPath = './cert/cert.pem';
  const httpsOptions = {
    key: readFileSync(resolve(keyPath)),
    cert: readFileSync(resolve(certPath)),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.setGlobalPrefix(process.env.API_VERSION || 'v1');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.API_PORT || 3000);
}
bootstrap().then(() =>
  console.log(
    `🟢 Servidor escuchando en puerto: ${process.env.API_PORT || 3000} 🚀`,
  ),
);
