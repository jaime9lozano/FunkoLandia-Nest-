import { Test, TestingModule } from '@nestjs/testing';
import { FunkoController } from './funko.controller';
import { FunkoService } from './funko.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Funko } from './entities/funko.entity';
import { ResponseFunko } from './dto/response-funko.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Request } from 'express';

describe('FunkoController', () => {
  let controller: FunkoController;
  let service: FunkoService;
  const funkoServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
    updateImage: jest.fn(),
  };

  beforeEach(async () => {
    // Creamos un módulo de prueba de NestJS que nos permitirá crear una instancia de nuestro controlador.
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // importamos el módulo de caché, lo necesita el controlador (interceptores y anotaciones)
      controllers: [FunkoController],
      providers: [{ provide: FunkoService, useValue: funkoServiceMock }],
    }).compile();

    controller = module.get<FunkoController>(FunkoController);
    service = module.get<FunkoService>(FunkoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('findAll', () => {
    it('Devuelve FindAll', async () => {
      const testFunkos: Funko[] = [];
      jest.spyOn(service, 'findAll').mockResolvedValue(testFunkos);
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });
  });
  describe('findOne', () => {
    it('Devuelve un funko', async () => {
      const id = 1;
      const mockResult: ResponseFunko = new ResponseFunko();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult);
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(mockResult).toBeInstanceOf(ResponseFunko);
    });

    it('Devuelve NotFound', async () => {
      const id = 1;
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });
  describe('create', () => {
    it('Create funko', async () => {
      const dto: CreateFunkoDto = {
        nombre: 'funko-test2',
        precio: 100,
        cantidad: 10,
        imagen: 'imagen-test2',
        categoria: 'categoria-test2',
      };
      const mockResult: ResponseFunko = new ResponseFunko();
      jest.spyOn(service, 'create').mockResolvedValue(mockResult);
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(mockResult).toBeInstanceOf(ResponseFunko);
    });
  });
  describe('update', () => {
    it('Funko actualizado', async () => {
      const id = 1;
      const dto: UpdateFunkoDto = {
        nombre: 'funko-test2',
        precio: 100,
        cantidad: 10,
        imagen: 'imagen-test2',
        categoria: 'categoria-test2',
        is_deleted: true,
      };
      const mockResult: ResponseFunko = new ResponseFunko();
      jest.spyOn(service, 'update').mockResolvedValue(mockResult);
      await controller.update(id, dto);
      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(mockResult).toBeInstanceOf(ResponseFunko);
    });

    it('Devuelve NotFound', async () => {
      const id = 1;
      const dto: UpdateFunkoDto = {
        nombre: 'funko-test2',
        precio: 100,
        cantidad: 10,
        imagen: 'imagen-test2',
        categoria: 'categoria-test2',
        is_deleted: true,
      };
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('remove', () => {
    it('Funko eliminado', async () => {
      const id = 1;
      const mockResult: ResponseFunko = new ResponseFunko();
      jest.spyOn(service, 'removeSoft').mockResolvedValue(mockResult);
      await controller.remove(id);
      expect(service.removeSoft).toHaveBeenCalledWith(id);
    });

    it('Devuelve NotFound', async () => {
      const id = 1;
      jest
        .spyOn(service, 'removeSoft')
        .mockRejectedValue(new NotFoundException());
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
  describe('updateImage', () => {
    it('should update a producto image', async () => {
      const mockId = 1;
      const mockFile = {} as Express.Multer.File;
      const mockReq = {} as Request;
      const mockResult: ResponseFunko = new ResponseFunko();

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult);

      await controller.updateImage(mockId, mockFile, mockReq);
      expect(service.updateImage).toHaveBeenCalledWith(
        mockId,
        mockFile,
        mockReq,
        true,
      );
      expect(mockResult).toBeInstanceOf(ResponseFunko);
    });
  });
});
