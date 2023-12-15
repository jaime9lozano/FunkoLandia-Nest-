import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import { IsBoolean } from 'class-validator';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @IsBoolean({ message: 'is_deleted tiene que ser un boolean' })
  readonly is_deleted: boolean = false;
}
