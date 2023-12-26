import { Module } from '@nestjs/common';
import { FunkoService } from './funko.service';
import { FunkoController } from './funko.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funko } from './entities/funko.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
  ],
  controllers: [FunkoController],
  providers: [FunkoService],
})
export class FunkoModule {}
