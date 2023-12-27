import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({ message: 'La categoria debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoria es obligatorio' })
  @Length(3, 100, {
    message: 'La categoria debe tener entre 3 y 100 caracteres',
  })
  categoria: string;
}
