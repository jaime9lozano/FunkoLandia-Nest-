import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { readFileSync } from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(path.resolve(process.env.SSL_KEY)),
    cert: readFileSync(path.resolve(process.env.SSL_CERT)),
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
