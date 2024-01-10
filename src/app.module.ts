import { Module } from '@nestjs/common';
import { FunkoModule } from './funko/funko.module';
import { CategoriaModule } from './categoria/categoria.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './websocket/notification.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './config/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CacheModule.register(),
    DatabaseModule,
    FunkoModule,
    CategoriaModule,
    StorageModule,
    NotificationsModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
