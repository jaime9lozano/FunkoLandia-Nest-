import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriasMapper } from './mapper/categoria.mapper';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria]), CacheModule.register()],
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriasMapper],
})
export class CategoriaModule {}
