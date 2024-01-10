import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsOptional()
  nombre?: string;
  @IsOptional()
  readonly precio?: number;
  @IsOptional()
  readonly cantidad?: number;
  @IsOptional()
  readonly imagen?: string;
  @IsOptional()
  @IsString()
  categoria?: string;
  @IsOptional()
  @IsBoolean({ message: 'is_deleted tiene que ser un boolean' })
  readonly is_deleted: boolean = false;
}
