import { CategoriaService } from './categoria.service';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriasMapper } from './mapper/categoria.mapper';
import { Cache } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Funko } from '../funko/entities/funko.entity';
import { BadRequestException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

describe('CategoriasService', () => {
  let service: CategoriaService;
  let repo: Repository<Categoria>;
  let mapper: CategoriasMapper;
  let cacheManager: Cache;

  // Creamos un mock de nuestro mapper de categorías.
  const categoriasMapperMock = {
    toCategoriaNew: jest.fn(),
    toCategoriaUpdate: jest.fn(),
  };

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    // Creamos un módulo de prueba de NestJS que nos permitirá crear una instancia de nuestro servicio.
    const module: TestingModule = await Test.createTestingModule({
      // Proporcionamos una lista de dependencias que se inyectarán en nuestro servicio.
      providers: [
        CategoriaService,
        { provide: CategoriasMapper, useValue: categoriasMapperMock },
        {
          provide: getRepositoryToken(Categoria), // Obtenemos el token de la entidad CategoriaEntity para inyectarlo en el servicio.
          useClass: Repository, // Creamos una instancia de la clase Repository para inyectarla en el servicio
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile(); // Compilamos el módulo de prueba.

    service = module.get<CategoriaService>(CategoriaService); // Obtenemos una instancia de nuestro servicio.
    // getRepositoryToken es una función de NestJS que se utiliza para generar un token de inyección de dependencias para un repositorio de TypeORM.
    repo = module.get<Repository<Categoria>>(getRepositoryToken(Categoria)); // Obtenemos una instancia de nuestro repositorio de categorías.
    mapper = module.get<CategoriasMapper>(CategoriasMapper); // Obtenemos una instancia de nuestro mapper de categorías.
    cacheManager = module.get<Cache>(CACHE_MANAGER); // Obtenemos una instancia del caché
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    it('Devolvera FindAll del repositorio', async () => {
      const mockCategories = [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          categoria: 'Category 1',
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
          productos: [] as Funko[],
        },
      ];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null));
      const repoFind = jest
        .spyOn(repo, 'find')
        .mockResolvedValue(mockCategories);
      //jest.spyOn(cacheManager, 'set').mockResolvedValue();
      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalled(); // Verifica que cacheManager.get fue llamado
      expect(repoFind).toHaveBeenCalled(); // Verifica que repo.find fue llamado
      expect(result).toEqual(mockCategories); // Verifica que la función devuelve los datos del repositorio
    });
    it('Devolvera FindAll del cache', async () => {
      const mockCategories = [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          categoria: 'Category 1',
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
          productos: [] as Funko[],
        },
      ];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('all_categorias');
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('Una categoria del repositorio', async () => {
      const testCategory = new Categoria();
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null));

      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCategory);

      jest.spyOn(cacheManager, 'set').mockResolvedValue();

      expect(
        await service.findOne('123e4567-e89b-12d3-a456-426614174002'),
      ).toEqual(testCategory);
    });

    it('Una categoria del cache', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174002';
      const cachedCategory = {
        id,
        categoria: 'Category 1',
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        productos: [] as Funko[],
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedCategory);

      const result = await service.findOne(id);

      expect(result).toEqual(cachedCategory);
    });
  });
  describe('create', () => {
    it('Devuelve categoria creada', async () => {
      const testCategory = new Categoria();
      testCategory.categoria = 'test';
      const dto = new CreateCategoriaDto();

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(), // Añade esto
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(mapper, 'toCategoriaNew').mockReturnValue(testCategory);
      jest.spyOn(repo, 'save').mockResolvedValue(testCategory);
      jest.spyOn(service, 'exists').mockResolvedValue(null);
      const toCategoriaNewMock = jest
        .spyOn(mapper, 'toCategoriaNew')
        .mockReturnValue(testCategory);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.create(dto)).toEqual(testCategory);
      expect(toCategoriaNewMock).toHaveBeenCalledWith(dto);
    });
    it('Devuelve BadRequestException', async () => {
      const testCategory = new Categoria();
      testCategory.categoria = 'test';
      const dto = new CreateCategoriaDto();

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(testCategory), // Simula que la categoría ya existe
      } as any);

      jest.spyOn(mapper, 'toCategoriaNew').mockReturnValue(testCategory);
      jest.spyOn(repo, 'save').mockResolvedValue(testCategory);
      jest.spyOn(service, 'exists').mockResolvedValue(testCategory);
      const toCategoriaNewMock = jest
        .spyOn(mapper, 'toCategoriaNew')
        .mockReturnValue(testCategory);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(toCategoriaNewMock).toHaveBeenCalledWith(dto);
    });
  });
  describe('update', () => {
    it('Devuelve categoria actualizada', async () => {
      const testCategory = new Categoria();
      testCategory.categoria = 'test';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(testCategory),
      };

      const mockUpdateCategoriaDto = new UpdateCategoriaDto();

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(service, 'exists').mockResolvedValue(testCategory);
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCategory);
      jest.spyOn(mapper, 'toCategoriaUpdate').mockReturnValue(testCategory);
      jest.spyOn(repo, 'save').mockResolvedValue(testCategory);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174002',
        mockUpdateCategoriaDto,
      );

      expect(result).toEqual(testCategory);
    });
  });
  describe('remove', () => {
    it('delete', async () => {
      const testCategory = new Categoria();
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCategory);
      jest.spyOn(repo, 'remove').mockResolvedValue(testCategory);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(
        await service.remove('123e4567-e89b-12d3-a456-426614174002'),
      ).toEqual(testCategory);
    });
  });
  describe('removeSoft', () => {
    it('delete', async () => {
      const testCategory = new Categoria();
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(testCategory);
      jest.spyOn(repo, 'save').mockResolvedValue(testCategory);
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(
        await service.removeSoft('123e4567-e89b-12d3-a456-426614174002'),
      ).toEqual(testCategory);
    });
  });
});
