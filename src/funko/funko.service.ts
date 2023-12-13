import { Injectable } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Injectable()
export class FunkoService {
  findAll() {
    return `This action returns all funko`;
  }

  findOne(id: number) {
    return `This action returns a #${id} funko`;
  }

  create(createFunkoDto: CreateFunkoDto) {
    return 'This action adds a new funko';
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    return `This action updates a #${id} funko`;
  }

  remove(id: number) {
    return `This action removes a #${id} funko`;
  }
}
