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
import { hash } from 'typeorm/util/StringUtils';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriasMapper: CategoriasMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findAll(query: PaginateQuery) {
    const cache = await this.cacheManager.get(
      `all_categories_page_${hash(JSON.stringify(query))}`,
    );
    if (cache) {
      return cache;
    }
    const res = await paginate(query, this.categoriaRepository, {
      sortableColumns: ['categoria'],
      defaultSortBy: [['categoria', 'ASC']],
      searchableColumns: ['categoria'],
      filterableColumns: {
        categoria: [FilterOperator.EQ, FilterSuffix.NOT],
        is_deleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    });
    await this.cacheManager.set(
      `all_categories_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    );
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
    const res: Categoria = await this.categoriaRepository.save({
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
  async invalidateKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys();
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern));
    const promises = keysToDelete.map((key) => this.cacheManager.del(key));
    await Promise.all(promises);
  }
}
