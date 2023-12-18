import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Categoria } from '../entities/funko.entity';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  readonly nombre: string;
  @IsNotEmpty({ message: 'El precio no puede estar vacío' })
  @IsNumber()
  @Min(0, { message: 'El precio no puede estar negativo' })
  readonly precio: number;
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía' })
  @Min(0, { message: 'La cantidad no puede estar negativo' })
  @IsInt({ message: 'La cantidad debe ser un entero' })
  readonly cantidad: number;
  @IsUrl()
  @IsNotEmpty({ message: 'La imagen no puede estar vacía' })
  readonly imagen: string;
  @IsNotEmpty({ message: 'La categoria no puede estar vacía' })
  @IsEnum(Categoria, {
    message: 'La categoria debe ser disney,marvel,superheroes,otros',
  })
  @IsBoolean({ message: 'is_deleted tiene que ser un boolean' })
  readonly is_deleted: boolean = false;
}
