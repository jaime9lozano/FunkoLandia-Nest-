import { Categoria } from '../entities/funko.entity';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateFunkoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  readonly precio: number;
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  readonly cantidad: number;
  @IsString()
  @IsNotEmpty()
  readonly imagen: string;
  @IsNotEmpty()
  @IsEnum(Categoria)
  readonly categoria: Categoria;
}
