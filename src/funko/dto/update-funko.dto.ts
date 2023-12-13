import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  is_deleted: boolean = false;
}
