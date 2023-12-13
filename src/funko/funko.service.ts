import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from './entities/funko.entity';

@Injectable()
export class FunkoService {
  funkos: Funko[] = [];
  nextID: number = 1;
  findAll() {
    return this.funkos;
  }

  findOne(id: number) {
    const foundFunko = this.funkos.find((funko) => funko.id === id);
    if (foundFunko) {
      return foundFunko;
    } else {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
  }

  create(createFunkoDto: CreateFunkoDto) {
    const newFunko: Funko = {
      id: this.nextID,
      ...createFunkoDto,
      fecha_cre: new Date(),
      fecha_act: new Date(),
      is_deleted: false,
    };

    this.funkos.push(newFunko);

    this.nextID++;

    return newFunko;
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    const index = this.funkos.findIndex((funko) => funko.id === id);

    if (index !== -1) {
      const updatedFunko = {
        ...this.funkos[index],
        ...updateFunkoDto,
        fecha_act: new Date(),
      };

      this.funkos[index] = updatedFunko;

      return updatedFunko;
    } else {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
  }

  remove(id: number) {
    const index = this.funkos.findIndex((funko) => funko.id === id);
    if (index !== -1) {
      this.funkos.splice(index, 1)[0];
    } else {
      throw new NotFoundException(`Funko with id ${id} not found`);
    }
  }
}
