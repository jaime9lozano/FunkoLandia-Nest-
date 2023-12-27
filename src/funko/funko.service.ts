import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from './entities/funko.entity';
import { FunkoMapper } from './mapper/funko.mapper';
import { Categoria } from '../categoria/entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FunkoService {
  logger: Logger = new Logger(FunkoService.name);
  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly mapper: FunkoMapper,
  ) {}
  async findAll() {
    this.logger.log('Buscando todos los funkos');
    return this.funkoRepository.find();
  }

  async findOne(id: number) {
    this.logger.log(`Buscando funko con id ${id}`);

    const funkoToFind = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', { id })
      .getOne();

    if (!funkoToFind) {
      throw new NotFoundException(`Funko con id ${id} no encontrado`);
    }

    return this.mapper.toResponse(funkoToFind);
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando un nuevo funko');
    const categoria = await this.checkCategoria(createFunkoDto.categoria);
    const funkoToCreate = this.mapper.toFunko(createFunkoDto, categoria);
    const funkoCreated = await this.funkoRepository.save(funkoToCreate);
    return this.mapper.toResponse(funkoCreated);
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Actualizando funko con id ${id}`);
    const funkoToUpdate = await this.findOne(id);
    let categoria: Categoria;
    if (updateFunkoDto.categoria) {
      // tiene categoria, comprobamos que exista
      categoria = await this.checkCategoria(updateFunkoDto.categoria);
    } else {
      // no tiene categoria, dejamos la que tenía
      categoria = await this.checkCategoria(funkoToUpdate.categoria);
    }
    const productoUpdated = await this.funkoRepository.save({
      ...funkoToUpdate,
      ...updateFunkoDto,
      categoria,
    });
    return this.mapper.toResponse(productoUpdated);
  }

  async remove(id: number) {
    this.logger.log(`Eliminando funko con id ${id}`);
    const funkoToRemove = await this.exists(id);
    const funkoRemoved = await this.funkoRepository.remove(funkoToRemove);
    return this.mapper.toResponse(funkoRemoved);
  }

  async removeSoft(id: number) {
    this.logger.log(`Remove producto by id:${id}`);
    const funkoToRemove = await this.exists(id);
    funkoToRemove.is_deleted = true;
    const funkoRemoved = await this.funkoRepository.save(funkoToRemove);
    return this.mapper.toResponse(funkoRemoved);
  }
  public async checkCategoria(nombreCategoria: string): Promise<Categoria> {
    const categoriaU = await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(categoria) = LOWER(:categoria)', {
        categoria: nombreCategoria.toLowerCase(),
      })
      .getOne();

    if (!categoriaU) {
      this.logger.log(`Categoría ${nombreCategoria} no existe`);
      throw new BadRequestException(`Categoría ${nombreCategoria} no existe`);
    }
    return categoriaU;
  }

  public async exists(id: number): Promise<Funko> {
    const funko = await this.funkoRepository.findOneBy({ id });
    if (!funko) {
      this.logger.log(`Producto con id ${id} no encontrado`);
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return funko;
  }
}
