import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  @IsOptional()
  categoria?: string;

  @IsBoolean({ message: 'isDeleted debe ser un booleano' })
  @IsOptional()
  is_deleted?: boolean;
}
