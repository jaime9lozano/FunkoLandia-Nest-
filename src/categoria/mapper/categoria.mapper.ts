import { Injectable } from '@nestjs/common';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';

@Injectable()
export class CategoriasMapper {
  toCategoriaNew(createCategoriaDto: CreateCategoriaDto): Categoria {
    return {
      productos: [],
      id: uuidv4(),
      ...createCategoriaDto,
      created_at: new Date(),
      updated_at: new Date(),
      isDeleted: false,
    };
  }
  toCategoriaUpdate(
    updateCategoriaDto: UpdateCategoriaDto,
    updateCategoria: Categoria,
  ): Categoria {
    return {
      ...updateCategoria,
      ...updateCategoriaDto,
      updated_at: new Date(),
    };
  }
}
