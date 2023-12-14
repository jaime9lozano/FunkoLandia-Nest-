import { Categoria } from '../entities/funko.entity';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateFunkoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly precio: number;
  @IsNotEmpty()
  @Min(0)
  @IsInt()
  readonly cantidad: number;
  @IsUrl()
  @IsNotEmpty()
  readonly imagen: string;
  @IsNotEmpty()
  @IsEnum(Categoria)
  readonly categoria: Categoria;
}
