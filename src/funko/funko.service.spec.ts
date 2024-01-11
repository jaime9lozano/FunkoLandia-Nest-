import { Test, TestingModule } from '@nestjs/testing';
import { FunkoService } from './funko.service';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { FunkoMapper } from './mapper/funko.mapper';
import { Categoria } from '../categoria/entities/categoria.entity';
import { Funko } from './entities/funko.entity';
import { FunkoNotificationsGateway } from '../websocket/funko-notification.gateway';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotificationsModule } from '../websocket/notification.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResponseFunko } from './dto/response-funko.dto';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Paginated } from 'nestjs-paginate';
import { hash } from 'typeorm/util/StringUtils';

describe('FunkoService', () => {
  let service: FunkoService; // servicio
  let funkoRepository: Repository<Funko>; // repositorio
  let categoriaRepository: Repository<Categoria>; // repositorio
  let mapper: FunkoMapper; // mapper
  let storageService: StorageService; // servicio de almacenamiento
  let funkoNotificationsGateway: FunkoNotificationsGateway; // gateway de notificaciones
  let cacheManager: Cache;

  const funkoMapperMock = {
    toFunko: jest.fn(),
    toResponse: jest.fn(),
  };
  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
  };
  const funkoNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  };
  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
      // Proporcionamos una lista de dependencias que se inyectarán en nuestro servicio.
      providers: [
        // Inyectamos al servicio los repositorios y el mapper
        FunkoService,
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Categoria), useClass: Repository },
        { provide: FunkoMapper, useValue: funkoMapperMock },
        { provide: StorageService, useValue: storageServiceMock },
        {
          provide: FunkoNotificationsGateway,
          useValue: funkoNotificationsGatewayMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile();

    service = module.get<FunkoService>(FunkoService); // Obtenemos una instancia de nuestro servicio.
    funkoRepository = module.get(getRepositoryToken(Funko)); // Obtenemos una instancia del repositorio de productos
    categoriaRepository = module.get(getRepositoryToken(Categoria)); // Obtenemos una instancia del repositorio de categorías
    mapper = module.get<FunkoMapper>(FunkoMapper); // Obtenemos una instancia del mapper
    storageService = module.get<StorageService>(StorageService); // Obtenemos una instancia del servicio de almacenamiento
    funkoNotificationsGateway = module.get<FunkoNotificationsGateway>(
      FunkoNotificationsGateway,
    ); // Obtenemos una instancia del gateway de notificaciones
    cacheManager = module.get<Cache>(CACHE_MANAGER); // Obtenemos una instancia del cache manager
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    it('Devuelve FindAll repository', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null));

      // Mock the cacheManager.set method
      jest.spyOn(cacheManager, 'set').mockResolvedValue();

      // Debemos simular la consulta
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest.spyOn(mapper, 'toResponse').mockReturnValue(new ResponseFunko());

      // Call the findAll method
      const result: any = await service.findAll(paginateOptions);

      // console.log(result)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit);
      // Expect the result to have the correct currentPage
      expect(result.meta.currentPage).toEqual(paginateOptions.page);
      // Expect the result to have the correct totalPages
      // expect(result.meta.totalPages).toEqual(1) // You may need to adjust this value based on your test case
      // Expect the result to have the correct current link
      expect(result.links.current).toEqual(
        `funkos?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`,
      );
      expect(cacheManager.get).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('FindAll del cache', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      };

      // Mock the paginate method to return a Paginated object
      const testProductos = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'funko?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<Funko>;

      // Mock the cacheManager.get method to return a cached result
      jest.spyOn(cacheManager, 'get').mockResolvedValue(testProductos);

      // Call the findAll method
      const result = await service.findAll(paginateOptions);

      // Expect the cacheManager.get method to be called with the correct key
      expect(cacheManager.get).toHaveBeenCalledWith(
        `all_funkos_page_${hash(JSON.stringify(paginateOptions))}`,
      );

      // Expect the result to be the cached result
      expect(result).toEqual(testProductos);
    });
  });
  describe('findOne', () => {
    it('Devuelve FindOne repository', async () => {
      const result = new Funko();
      const resultDto = new ResponseFunko();
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(), // Añade esto
        getOne: jest.fn().mockResolvedValue(result),
      };
      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null));

      jest.spyOn(mapper, 'toResponse').mockReturnValue(resultDto);

      jest.spyOn(cacheManager, 'set').mockResolvedValue();

      expect(await service.findOne(1)).toEqual(resultDto);
      expect(mapper.toResponse).toHaveBeenCalledTimes(1);
    });
    it('Devuelve FindOne cache', async () => {
      const resultDto = new ResponseFunko();

      const getSpy = jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValue(resultDto);

      const result = await service.findOne(1);

      expect(await service.findOne(1)).toEqual(resultDto);
      expect(getSpy).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(resultDto);
    });
  });
  describe('create', () => {
    it('Create Funko', async () => {
      const createProductoDto = new CreateFunkoDto();
      const mockCategoriaEntity = new Categoria();
      const mockProductoEntity = new Funko();
      const mockResponseProductoDto = new ResponseFunko();

      jest
        .spyOn(service, 'checkCategoria')
        .mockResolvedValue(mockCategoriaEntity);

      jest.spyOn(mapper, 'toFunko').mockReturnValue(mockProductoEntity);

      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockProductoEntity);

      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockResponseProductoDto);

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.create(createProductoDto)).toEqual(
        mockResponseProductoDto,
      );
      expect(mapper.toFunko).toHaveBeenCalled();
      expect(funkoRepository.save).toHaveBeenCalled();
      expect(service.checkCategoria).toHaveBeenCalled();
    });
  });
  describe('update', () => {
    it('Update Funko', async () => {
      const updateProductoDto = new UpdateFunkoDto();
      const mockProductoEntity = new Funko();
      const mockResponseProductoDto = new ResponseFunko();
      const mockCategoriaEntity = new Categoria();

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockProductoEntity),
      };

      jest
        .spyOn(funkoRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest
        .spyOn(service, 'checkCategoria')
        .mockResolvedValue(mockCategoriaEntity);

      jest.spyOn(service, 'exists').mockResolvedValue(mockProductoEntity);

      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockProductoEntity);

      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockResponseProductoDto);

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.update(1, updateProductoDto)).toEqual(
        mockResponseProductoDto,
      );
    });
  });
  describe('remove', () => {
    it('Elimina Funko', async () => {
      const mockProductoEntity = new Funko();
      const mockResponseProductoDto = new ResponseFunko();

      jest.spyOn(service, 'exists').mockResolvedValue(mockProductoEntity);

      jest
        .spyOn(funkoRepository, 'remove')
        .mockResolvedValue(mockProductoEntity);

      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockResponseProductoDto);

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.remove(1)).toEqual(mockResponseProductoDto);
    });
  });
  describe('removeSoft', () => {
    it('Funko eliminado is_deleted', async () => {
      const mockProductoEntity = new Funko();
      const mockResponseProductoDto = new ResponseFunko();

      jest.spyOn(service, 'exists').mockResolvedValue(mockProductoEntity);

      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockProductoEntity);

      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockResponseProductoDto);

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.removeSoft(1)).toEqual(mockResponseProductoDto);
    });
  });
  describe('exists', () => {
    const result = new Funko();
    it('Verdadero', async () => {
      const id = 1;
      jest.spyOn(funkoRepository, 'findOneBy').mockResolvedValue(new Funko());

      expect(await service.exists(id)).toEqual(result);
    });

    it('Falso', async () => {
      const id = 1;
      jest.spyOn(funkoRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.exists(id)).rejects.toThrow(NotFoundException);
    });
  });
  describe('checkCategoria', () => {
    it('Verdadero', async () => {
      const categoria = new Categoria();
      const categoriaNombre = 'category';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(), // Añade esto
        getOne: jest.fn().mockResolvedValue(categoria),
      };

      jest
        .spyOn(categoriaRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      expect(await service.checkCategoria(categoriaNombre)).toBe(categoria);
    });

    it('Falso', async () => {
      const categoriaNombre = 'category';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .spyOn(categoriaRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(service.checkCategoria(categoriaNombre)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('updateImage', () => {
    it('Update image Funko', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      };
      const mockFile = {
        filename: 'new_image',
      };

      const mockProductoEntity = new Funko();
      const mockResponseProductoDto = new ResponseFunko();

      jest.spyOn(service, 'exists').mockResolvedValue(mockProductoEntity);

      jest.spyOn(funkoRepository, 'save').mockResolvedValue(mockProductoEntity);

      jest.spyOn(mapper, 'toResponse').mockReturnValue(mockResponseProductoDto);

      expect(
        await service.updateImage(1, mockFile as any, mockRequest as any, true),
      ).toEqual(mockResponseProductoDto);

      expect(storageService.removeFile).toHaveBeenCalled();
      expect(storageService.getFileNameWithouUrl).toHaveBeenCalled();
    });
  });
});
