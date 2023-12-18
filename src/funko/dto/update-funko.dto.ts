import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Categoria } from '../entities/funko.entity';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsOptional()
  readonly nombre?: string;
  @IsOptional()
  readonly precio?: number;
  @IsOptional()
  readonly cantidad?: number;
  @IsOptional()
  readonly imagen?: string;
  @IsOptional()
  readonly categoria?: Categoria;
  @IsOptional()
  @IsBoolean({ message: 'is_deleted tiene que ser un boolean' })
  readonly is_deleted: boolean = false;
}
