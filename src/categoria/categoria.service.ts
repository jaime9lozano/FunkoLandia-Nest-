import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { CategoriasMapper } from './mapper/categoria.mapper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriasMapper: CategoriasMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findAll() {
    const cache: Categoria[] = await this.cacheManager.get('all_categorias');
    if (cache) {
      return cache;
    }
    const res = this.categoriaRepository.find();
    await this.cacheManager.set('all_categorias', res, 60);
    return res;
  }

  async findOne(id: string): Promise<Categoria> {
    const cache: Categoria = await this.cacheManager.get(`categoria_${id}`);
    if (cache) {
      return cache;
    }
    const categoriaToFound = await this.categoriaRepository.findOneBy({ id });
    if (!categoriaToFound) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    } else {
      await this.cacheManager.set(`categoria_${id}`, categoriaToFound, 60);
      return categoriaToFound;
    }
  }

  async create(createCategoriaDto: CreateCategoriaDto) {
    const categoriaToCreate =
      this.categoriasMapper.toCategoriaNew(createCategoriaDto);
    const categoria = await this.exists(categoriaToCreate.categoria);
    if (categoria) {
      throw new BadRequestException(
        `La categoria con nombre ${categoria.categoria} ya existe`,
      );
    } else {
      const res = this.categoriaRepository.save(categoriaToCreate);
      await this.invalidateKey('all_categorias');
      return res;
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
    const res = this.categoriaRepository.save({
      ...categoryToUpdated,
      ...updateCategoriaDto,
    });
    await this.invalidateKey(`categoria_${id}`);
    await this.invalidateKey('all_categorias');
    return res;
  }

  async remove(id: string) {
    const categoriaToRemove = await this.findOne(id);
    const res = await this.categoriaRepository.remove(categoriaToRemove);
    await this.invalidateKey(`categoria_${id}`);
    await this.invalidateKey('all_categorias');
    return res;
  }
  async removeSoft(id: string) {
    const categoriaToRemove = await this.findOne(id);
    const res = await this.categoriaRepository.save({
      ...categoriaToRemove,
      updatedAt: new Date(),
      is_deleted: true,
    });
    await this.invalidateKey(`categoria_${id}`);
    await this.invalidateKey('all_categorias');
    return res;
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
  public async invalidateKey(key: string) {
    await this.cacheManager.del(key);
  }
}
