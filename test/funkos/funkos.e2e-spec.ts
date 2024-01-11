import { INestApplication, NotFoundException } from '@nestjs/common';
import { ResponseFunko } from '../../src/funko/dto/response-funko.dto';
import { Funko } from '../../src/funko/entities/funko.entity';
import { Categoria } from '../../src/categoria/entities/categoria.entity';
import { CreateFunkoDto } from '../../src/funko/dto/create-funko.dto';
import { UpdateFunkoDto } from '../../src/funko/dto/update-funko.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { FunkoController } from '../../src/funko/funko.controller';
import { FunkoService } from '../../src/funko/funko.service';
import * as request from 'supertest';

describe('ProductosController (e2e)', () => {
  let app: INestApplication;
  const myEndpoint = `/funkos`;
  const myFunkoResponse: ResponseFunko = {
    id: 1,
    nombre: 'funko-test',
    precio: 100,
    cantidad: 10,
    imagen: 'imagen-test',
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    categoria: 'categoria-test',
  };
  const myCategoria: Categoria = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    categoria: 'Category-test',
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    productos: [] as Funko[],
  };
  const myFunko: Funko = {
    id: 1,
    nombre: 'funko-test',
    precio: 100,
    cantidad: 10,
    imagen: 'imagen-test',
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    categoria: myCategoria,
  };
  const createFunkoDto: CreateFunkoDto = {
    nombre: 'funko-test2',
    precio: 100,
    cantidad: 10,
    imagen: 'imagen-test2',
    categoria: 'categoria-test2',
  };
  const updateFunkoDto: UpdateFunkoDto = {
    nombre: 'funko-test2',
    precio: 100,
    cantidad: 10,
    imagen: 'imagen-test2',
    categoria: 'categoria-test2',
    is_deleted: true,
  };
  const mockFunkosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
    updateImage: jest.fn(),
    exists: jest.fn(),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FunkoController],
      providers: [
        FunkoService,
        { provide: FunkoService, useValue: mockFunkosService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  describe('GET /funkos', () => {
    it('Devuelve FindAll Page', async () => {
      mockFunkosService.findAll.mockResolvedValue([myFunko]);

      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200);
      expect(() => {
        expect(body).toEqual([myFunko]);
        expect(mockFunkosService.findAll).toHaveBeenCalled();
      });
    });
    it('Devuelve FindAll Page con query', async () => {
      mockFunkosService.findAll.mockResolvedValue([myFunko]);

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}?page=1&limit=10`)
        .expect(200);
      expect(() => {
        expect(body).toEqual([myFunko]);
        expect(mockFunkosService.findAll).toHaveBeenCalled();
      });
    });
  });
  describe('GET /funkos/:id', () => {
    it('Devuelve el findAll', async () => {
      mockFunkosService.findOne.mockResolvedValue(myFunkoResponse);

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myFunkoResponse.id}`)
        .expect(200);
      expect(() => {
        expect(body).toEqual(myFunkoResponse);
        expect(mockFunkosService.findOne).toHaveBeenCalled();
      });
    });

    it('Devuelve NotFound', async () => {
      mockFunkosService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${myFunkoResponse.id}`)
        .expect(404);
    });
  });
  describe('POST /funkos', () => {
    it('Crea un funko', async () => {
      mockFunkosService.create.mockResolvedValue(myFunkoResponse);

      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createFunkoDto)
        .expect(201);
      expect(() => {
        expect(body).toEqual(myFunkoResponse);
        expect(mockFunkosService.create).toHaveBeenCalledWith(createFunkoDto);
      });
    });
  });
  describe('PUT /funkos/:id', () => {
    it('Devuelve funko actualizado', async () => {
      mockFunkosService.update.mockResolvedValue(myFunkoResponse);

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myFunkoResponse.id}`)
        .send(updateFunkoDto)
        .expect(200);
      expect(() => {
        expect(body).toEqual(myFunkoResponse);
        expect(mockFunkosService.update).toHaveBeenCalledWith(
          myFunkoResponse.id,
          updateFunkoDto,
        );
      });
    });

    it('Devuelve NotFound', async () => {
      mockFunkosService.update.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${myFunkoResponse.id}`)
        .send(mockFunkosService)
        .expect(404);
    });
  });
  describe('DELETE /funkos/:id', () => {
    it('Elimina un funko', async () => {
      mockFunkosService.remove.mockResolvedValue(myFunkoResponse);

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myFunkoResponse.id}`)
        .expect(204);
    });

    it('Devuelve NotFound', async () => {
      mockFunkosService.removeSoft.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${myFunkoResponse.id}`)
        .expect(404);
    });
  });
  describe('PATCH /funkos/imagen/:id', () => {
    it('Cambiar imagen a funko', async () => {
      const file = Buffer.from('file');

      mockFunkosService.exists.mockResolvedValue(true);

      mockFunkosService.updateImage.mockResolvedValue(myFunkoResponse);

      await request(app.getHttpServer())
        .patch(`${myEndpoint}/imagen/${myFunkoResponse.id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(200);
    });
    it('tipo de archivo no válido', async () => {
      const invalidFile = Buffer.from('file');

      mockFunkosService.exists.mockResolvedValue(true);

      await request(app.getHttpServer())
        .patch(`${myEndpoint}/imagen/${myFunkoResponse.id}`)
        .attach('file', invalidFile, 'text.txt') // archivo no válido (no es una imagen)
        .set('Content-Type', 'multipart/form-data')
        .expect(400, {
          statusCode: 400,
          message: 'Fichero no soportado. No es del tipo imagen válido',
          error: 'Bad Request',
        });
    });
  });
});
