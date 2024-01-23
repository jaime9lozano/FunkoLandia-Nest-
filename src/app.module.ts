import { Module } from '@nestjs/common';
import { FunkoModule } from './funko/funko.module';
import { CategoriaModule } from './categoria/categoria.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './websocket/notification.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PedidosModule } from './pedidos/pedidos.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CorsConfigModule } from './config/cors/cors.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CacheModule.register(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'adminPassword123',
        database: 'tienda',
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: true,
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        uri: `mongodb://admin:adminPassword123@localhost:27017/tienda`,
      }),
    }),
    CorsConfigModule,
    FunkoModule,
    CategoriaModule,
    StorageModule,
    NotificationsModule,
    PedidosModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
