import { Module } from '@nestjs/common';
import { FunkoService } from './funko.service';
import { FunkoController } from './funko.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funko } from './entities/funko.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { FunkoMapper } from './mapper/funko.mapper';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../websocket/notification.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
    CacheModule.register(),
    StorageModule,
    NotificationsModule,
  ],
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper],
})
export class FunkoModule {}
