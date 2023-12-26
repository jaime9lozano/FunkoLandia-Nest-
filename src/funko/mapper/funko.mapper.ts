import { Injectable } from '@nestjs/common';
import { CreateFunkoDto } from '../dto/create-funko.dto';
import { Funko } from '../entities/funko.entity';
import { plainToClass } from 'class-transformer';
import { Categoria } from '../../categoria/entities/categoria.entity';

@Injectable()
export class FunkoMapper {
  toFunko(createProductoDto: CreateFunkoDto, categoria: Categoria): Funko {
    const funkoEntity = plainToClass(Funko, createProductoDto);
    funkoEntity.categoria = categoria;
    return funkoEntity;
  }
}
