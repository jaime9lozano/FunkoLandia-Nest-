import { Injectable } from '@nestjs/common';
import { CreateFunkoDto } from '../dto/create-funko.dto';
import { Funko } from '../entities/funko.entity';
import { plainToClass } from 'class-transformer';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { ResponseFunko } from '../dto/response-funko.dto';

@Injectable()
export class FunkoMapper {
  toFunko(createProductoDto: CreateFunkoDto, categoria: Categoria): Funko {
    createProductoDto.nombre = createProductoDto.nombre.toLowerCase();
    categoria.categoria = categoria.categoria.toLowerCase();
    const funkoEntity = plainToClass(Funko, createProductoDto);
    funkoEntity.categoria = categoria;
    return funkoEntity;
  }
  toResponse(funko: Funko): ResponseFunko {
    const dto = plainToClass(ResponseFunko, funko);
    if (funko.categoria && funko.categoria.categoria) {
      dto.categoria = funko.categoria.categoria;
    } else {
      dto.categoria = null;
    }
    return dto;
  }
}
