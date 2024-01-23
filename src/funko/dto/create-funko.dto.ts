import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFunkoDto {
  @ApiProperty({
    example: 'SpiderMan',
    description: 'El nombre del funko',
    minLength: 1,
  })
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;
  @ApiProperty({
    example: 16.99,
    description: 'El precio del funko',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'El precio no puede estar vacío' })
  @IsNumber()
  @Min(0, { message: 'El precio no puede estar negativo' })
  readonly precio: number;
  @ApiProperty({
    example: 10,
    description: 'La cantidad del funko',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía' })
  @Min(0, { message: 'La cantidad no puede estar negativo' })
  @IsInt({ message: 'La cantidad debe ser un entero' })
  readonly cantidad: number;
  @ApiProperty({
    example: 'https://example.com/imagen.jpg',
    description: 'La URL de la imagen del funko',
    minLength: 1,
  })
  @IsUrl()
  @IsNotEmpty({ message: 'La imagen no puede estar vacía' })
  readonly imagen: string;
  @ApiProperty({
    example: 'superheroe',
    description: 'La categoría del funko',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  categoria: string;
}
