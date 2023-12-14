import { Categoria } from '../entities/funko.entity';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
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
  @IsUrl()
  @IsNotEmpty()
  readonly imagen: string;
  @IsNotEmpty()
  @IsEnum(Categoria)
  readonly categoria: Categoria;
}
