import { Injectable } from '@nestjs/common';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';

@Injectable()
export class CategoriasMapper {
  toCategoria(createCategoriaDto: CreateCategoriaDto): Categoria {
    const categoria: Categoria = {
      id: uuid.v4(),
      ...createCategoriaDto,
      created_at: new Date(),
      updated_at: new Date(),
      isDeleted: false,
    };
    return categoria;
  }
}
