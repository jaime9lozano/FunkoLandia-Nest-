import { Module } from '@nestjs/common';
import { FunkoModule } from './funko/funko.module';
import { CategoriaModule } from './categoria/categoria.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './websocket/notification.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './config/database/database.module';

@Module({
  imports: [
    CacheModule.register(),
    DatabaseModule,
    FunkoModule,
    CategoriaModule,
    StorageModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
