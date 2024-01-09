import { Module } from '@nestjs/common';
import { FunkoService } from './funko.service';
import { FunkoController } from './funko.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funko } from './entities/funko.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { FunkoMapper } from './mapper/funko.mapper';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
    StorageModule,
  ],
  controllers: [FunkoController],
  providers: [FunkoService, FunkoMapper],
})
export class FunkoModule {}
