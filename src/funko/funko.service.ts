import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from './entities/funko.entity';

@Injectable()
export class FunkoService {
  logger: Logger = new Logger(FunkoService.name);
  funkos: Funko[] = [];
  nextID: number = 1;
  async findAll() {
    this.logger.log('Buscando todos los funkos');
    return this.funkos;
  }

  async findOne(id: number) {
    this.logger.log(`Buscando funko con id ${id}`);
    const foundFunko = this.funkos.find((funko) => funko.id === id);
    if (foundFunko) {
      return foundFunko;
    } else {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando un nuevo funko');
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

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Actualizando funko con id ${id}`);
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

  async remove(id: number) {
    this.logger.log(`Eliminando funko con id ${id}`);
    const index = this.funkos.findIndex((funko) => funko.id === id);
    if (index !== -1) {
      this.funkos.splice(index, 1)[0];
    } else {
      throw new NotFoundException(`Funko with id ${id} not found`);
    }
  }
}
