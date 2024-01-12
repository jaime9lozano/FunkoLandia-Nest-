import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from './entities/funko.entity';
import { FunkoMapper } from './mapper/funko.mapper';
import { Categoria } from '../categoria/entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { FunkoNotificationsGateway } from '../websocket/funko-notification.gateway';
import {
  Notificacion,
  NotificacionTipo,
} from '../websocket/models/notificacion.model';
import { ResponseFunko } from './dto/response-funko.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { hash } from 'typeorm/util/StringUtils';

@Injectable()
export class FunkoService {
  logger: Logger = new Logger(FunkoService.name);
  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly mapper: FunkoMapper,
    private readonly storageService: StorageService,
    private readonly funkoNotificationGateway: FunkoNotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findAll(query: PaginateQuery) {
    this.logger.log('Buscando todos los funkos');
    const cache = await this.cacheManager.get(
      `all_funkos_page_${hash(JSON.stringify(query))}`,
    );
    if (cache) {
      this.logger.log('Buscando todos los funkos en cache');
      return cache;
    }

    const queryBuilder = this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria');
    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['nombre', 'imagen', 'precio', 'cantidad'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['nombre', 'imagen', 'precio', 'cantidad'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        imagen: [FilterOperator.EQ, FilterSuffix.NOT],
        precio: true,
        cantidad: true,
        is_deleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    });
    const res = {
      data: (pagination.data ?? []).map((funko) =>
        this.mapper.toResponse(funko),
      ),
      meta: pagination.meta,
      links: pagination.links,
    };
    await this.cacheManager.set(
      `all_funkos_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    );
    return res;
  }

  async findOne(id: number) {
    this.logger.log(`Buscando funko con id ${id}`);
    const cache: ResponseFunko = await this.cacheManager.get(`funko_${id}`);
    if (cache) {
      this.logger.log(`Funko con id ${id} encontrado en cache`);
      return cache;
    }
    const funkoToFind = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', { id })
      .getOne();

    if (!funkoToFind) {
      throw new NotFoundException(`Funko con id ${id} no encontrado`);
    }

    const res = this.mapper.toResponse(funkoToFind);
    await this.cacheManager.set(`funko_${id}`, res, 60);
    return res;
  }

  async create(createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando un nuevo funko');
    const categoria = await this.checkCategoria(createFunkoDto.categoria);
    const funkoToCreate = this.mapper.toFunko(createFunkoDto, categoria);
    const funkoCreated = await this.funkoRepository.save(funkoToCreate);
    const dto = this.mapper.toResponse(funkoCreated);
    this.onChange(NotificacionTipo.CREATE, dto);
    await this.invalidateKey('all_funkos');
    return dto;
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
    const dto = this.mapper.toResponse(productoUpdated);
    this.onChange(NotificacionTipo.UPDATE, dto);
    await this.invalidateKey('all_funkos');
    await this.invalidateKey(`funko_${id}`);
    return dto;
  }

  async remove(id: number) {
    this.logger.log(`Eliminando funko con id ${id}`);
    const funkoToRemove = await this.exists(id);
    if (funkoToRemove.imagen !== Funko.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${funkoToRemove.imagen}`);
      this.storageService.removeFile(funkoToRemove.imagen);
    }
    const funkoRemoved = await this.funkoRepository.remove(funkoToRemove);
    const dto = this.mapper.toResponse(funkoRemoved);
    this.onChange(NotificacionTipo.DELETE, dto);
    await this.invalidateKey('all_funkos');
    await this.invalidateKey(`funko_${id}`);
    return dto;
  }

  async removeSoft(id: number) {
    this.logger.log(`Eliminando funko con id:${id}`);
    const funkoToRemove = await this.exists(id);
    funkoToRemove.is_deleted = true;
    const funkoRemoved = await this.funkoRepository.save(funkoToRemove);
    const dto = this.mapper.toResponse(funkoRemoved);
    this.onChange(NotificacionTipo.DELETE, dto);
    await this.invalidateKey('all_funkos');
    await this.invalidateKey(`funko_${id}`);
    return dto;
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
      this.logger.log(`Funko con id ${id} no encontrado`);
      throw new NotFoundException(`Funko con id ${id} no encontrado`);
    }
    return funko;
  }
  public async updateImage(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = true,
  ) {
    this.logger.log(`Actualizar imagen del funko con id:${id}`);
    const funkoToUpdate = await this.exists(id);

    // Borramos su imagen si es distinta a la imagen por defecto
    if (funkoToUpdate.imagen !== Funko.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${funkoToUpdate.imagen}`);
      let imagePath = funkoToUpdate.imagen;
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithouUrl(
          funkoToUpdate.imagen,
        );
      }
      try {
        this.storageService.removeFile(imagePath);
      } catch (error) {
        this.logger.error(error); // No lanzamos nada si no existe!!
      }
    }

    if (!file) {
      throw new BadRequestException('Fichero no encontrado.');
    }

    funkoToUpdate.imagen = file.filename;
    const funkoUpdated = await this.funkoRepository.save(funkoToUpdate);
    const res = this.mapper.toResponse(funkoUpdated);
    this.onChange(NotificacionTipo.UPDATE, res);
    return res;
  }
  onChange(tipo: NotificacionTipo, data: ResponseFunko) {
    const notificacion = new Notificacion<ResponseFunko>(
      'FUNKOS',
      tipo,
      data,
      new Date(),
    );
    // Lo enviamos
    this.funkoNotificationGateway.sendMessage(notificacion);
  }
  public async invalidateKey(keyPattern: string) {
    const cacheKeys = await this.cacheManager.store.keys();
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern));
    const promises = keysToDelete.map((key) => this.cacheManager.del(key));
    await Promise.all(promises);
  }
}
