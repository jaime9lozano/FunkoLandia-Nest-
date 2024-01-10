import { Injectable } from '@nestjs/common';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';

@Injectable()
export class CategoriasMapper {
  toCategoriaNew(createCategoriaDto: CreateCategoriaDto): Categoria {
    createCategoriaDto.categoria = createCategoriaDto.categoria.toLowerCase();
    return {
      productos: [],
      id: uuidv4(),
      ...createCategoriaDto,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };
  }
  toCategoriaUpdate(
    updateCategoriaDto: UpdateCategoriaDto,
    updateCategoria: Categoria,
  ): Categoria {
    updateCategoria.categoria = updateCategoria.categoria.toLowerCase();
    return {
      ...updateCategoria,
      ...updateCategoriaDto,
      updated_at: new Date(),
    };
  }
}
