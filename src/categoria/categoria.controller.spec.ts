import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Funko } from '../funko/entities/funko.entity';
import { Categoria } from './entities/categoria.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Paginated } from 'nestjs-paginate';

describe('CategoriaController', () => {
  let controller: CategoriaController;
  let service: CategoriaService;
  const mockCategoriaService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // importamos el módulo de caché, lo necesita el controlador (interceptores y anotaciones)
      controllers: [CategoriaController],
      providers: [
        { provide: CategoriaService, useValue: mockCategoriaService },
      ],
    }).compile();

    controller = module.get<CategoriaController>(CategoriaController);
    service = module.get<CategoriaService>(CategoriaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('findAll', () => {
    it('FindAll', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'categorias',
      };

      const testCategories = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'categorias?page=1&limit=10&sortBy=categoria:ASC',
        },
      } as Paginated<Categoria>;
      jest.spyOn(service, 'findAll').mockResolvedValue(testCategories);
      const result: any = await controller.findAll(paginateOptions);

      // console.log(result)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit);
      // Expect the result to have the correct currentPage
      expect(result.meta.currentPage).toEqual(paginateOptions.page);
      // Expect the result to have the correct totalPages
      expect(result.meta.totalPages).toEqual(1); // You may need to adjust this value based on your test case
      // Expect the result to have the correct current link
      expect(result.links.current).toEqual(
        `categorias?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=categoria:ASC`,
      );
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('Devuelve categoria', async () => {
      const id = 'uuid';
      const mockResult: Categoria = new Categoria();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult);
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(mockResult).toBeInstanceOf(Categoria);
    });

    it('Devuelve notfound', async () => {
      const id = 'a uuid';
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });
  describe('create', () => {
    it('Crea categoria', async () => {
      const dto: CreateCategoriaDto = {
        categoria: 'test',
      };
      const mockResult: Categoria = new Categoria();
      jest.spyOn(service, 'create').mockResolvedValue(mockResult);
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
  describe('update', () => {
    it('Devuelve categoria', async () => {
      const id = 'a uuid';
      const dto: UpdateCategoriaDto = {
        categoria: 'test',
        is_deleted: true,
      };
      const mockResult: Categoria = new Categoria();
      jest.spyOn(service, 'update').mockResolvedValue(mockResult);
      await controller.update(id, dto);
      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(mockResult).toBeInstanceOf(Categoria);
    });

    it('Devuelve NotFound', async () => {
      const id = 'a uuid';
      const dto: UpdateCategoriaDto = {};
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('remove', () => {
    it('Categoria eliminada', async () => {
      const id = 'a uuid';
      const mockResult: Categoria = new Categoria();
      jest.spyOn(service, 'removeSoft').mockResolvedValue(mockResult);
      await controller.remove(id);
      expect(service.removeSoft).toHaveBeenCalledWith(id);
    });
    it('Devueve NotFound', async () => {
      const id = 'a uuid';
      jest
        .spyOn(service, 'removeSoft')
        .mockRejectedValue(new NotFoundException());
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
