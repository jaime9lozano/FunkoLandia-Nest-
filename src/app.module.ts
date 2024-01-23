import { Module } from '@nestjs/common';
import { FunkoModule } from './funko/funko.module';
import { CategoriaModule } from './categoria/categoria.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './websocket/notification.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { PedidosModule } from './pedidos/pedidos.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CorsConfigModule } from './config/cors/cors.module';
import { DatabaseModule } from './config/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CorsConfigModule,
    DatabaseModule,
    CacheModule.register(),
    AuthModule,
    FunkoModule,
    CategoriaModule,
    StorageModule,
    NotificationsModule,
    PedidosModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
