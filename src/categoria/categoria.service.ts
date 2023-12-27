import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { CategoriasMapper } from './mapper/categoria.mapper';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriasMapper: CategoriasMapper,
  ) {}
  async create(createCategoriaDto: CreateCategoriaDto) {
    const categoriaToCreate =
      this.categoriasMapper.toCategoriaNew(createCategoriaDto);
    const categoria = await this.exists(categoriaToCreate.categoria);
    if (categoria) {
      throw new BadRequestException(
        `La categoria con nombre ${categoria.categoria} ya existe`,
      );
    } else {
      return this.categoriaRepository.save(categoriaToCreate);
    }
  }

  async findAll() {
    return this.categoriaRepository.find();
  }

  async findOne(id: string): Promise<Categoria> {
    const categoriaToFound = await this.categoriaRepository.findOneBy({ id });
    if (!categoriaToFound) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    } else {
      return categoriaToFound;
    }
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    const categoryToUpdated = await this.findOne(id);
    if (updateCategoriaDto.categoria) {
      const categoria = await this.exists(updateCategoriaDto.categoria);
      if (categoria && categoria.id !== categoryToUpdated.id) {
        throw new BadRequestException(
          `La categoria con nombre ${categoria.categoria} ya existe`,
        );
      }
    }
    return this.categoriaRepository.save({
      ...categoryToUpdated,
      ...updateCategoriaDto,
    });
  }

  async remove(id: string) {
    const categoriaToRemove = await this.findOne(id);
    return await this.categoriaRepository.remove(categoriaToRemove);
  }
  async removeSoft(id: string) {
    const categoriaToRemove = await this.findOne(id);
    return await this.categoriaRepository.save({
      ...categoriaToRemove,
      updatedAt: new Date(),
      is_deleted: true,
    });
  }
  public async exists(nombreCategoria: string): Promise<Categoria> {
    const categoriaU = await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(categoria) = LOWER(:categoria)', {
        categoria: nombreCategoria.toLowerCase(),
      })
      .getOne();
    return categoriaU;
  }
}
