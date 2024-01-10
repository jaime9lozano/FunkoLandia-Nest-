import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateFunkoDto {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;
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
  @IsString()
  @IsNotEmpty()
  categoria: string;
}
