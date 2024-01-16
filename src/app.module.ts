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

@Module({
  imports: [
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
        uri: `mongodb://${process.env.DATABASE_USER}:${
          process.env.DATABASE_PASSWORD
        }@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${
          process.env.MONGO_DATABASE
        }`,
      }),
    }),
    FunkoModule,
    CategoriaModule,
    StorageModule,
    NotificationsModule,
    PedidosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
