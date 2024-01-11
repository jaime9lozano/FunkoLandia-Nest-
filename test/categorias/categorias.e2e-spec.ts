import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Categoria } from '../../src/categoria/entities/categoria.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { CategoriaController } from '../../src/categoria/categoria.controller';
import { CategoriaService } from '../../src/categoria/categoria.service';
import * as request from 'supertest';

describe('CategoriasController (e2e)', () => {
  let app: INestApplication;
  const myEndpoint = `/categorias`;
  const myCategoria: Categoria = {
    id: '7958ef01-9fe0-4f19-a1d5-79c917290ddf',
    categoria: 'nombre',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    productos: [],
  };

  const createCategoriaDto = {
    categoria: 'nombre',
  };

  const updateCategoriaDto = {
    categoria: 'nombre',
    is_deleted: false,
  };
  const mockCategoriasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
  };
  beforeEach(async () => {
    // Cargamos solo el controlador y el servicio que vamos a probar, no el módulo que arrastra con todo
    // No es de integración si no e2e, con mocks
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()], // importamos el módulo de caché, lo necesita el controlador (interceptores y anotaciones)
      controllers: [CategoriaController],
      providers: [
        CategoriaService,
        { provide: CategoriaService, useValue: mockCategoriasService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  describe('GET /categorias', () => {
    it('Devuelve Page findAll', async () => {
      mockCategoriasService.findAll.mockResolvedValue([myCategoria]);

      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200);
      expect(() => {
        expect(body).toEqual([myCategoria]);
        expect(mockCategoriasService.findAll).toHaveBeenCalled();
      });
    });
    it('Devuelve Page findAll con query', async () => {
      mockCategoriasService.findAll.mockResolvedValue([myCategoria]);

      const { body } = await request(app.getHttpServer())
        .get('${myEndpoint}?limit=10&page=1')
        .expect(200);
      expect(() => {
        expect(body).toEqual([myCategoria]);
        expect(mockCategoriasService.findAll).toHaveBeenCalled();
      });
    });
    describe('GET /categorias/:id', () => {
      it('Devuelve findOne', async () => {
        mockCategoriasService.findOne.mockResolvedValue(myCategoria);

        const { body } = await request(app.getHttpServer())
          .get(`${myEndpoint}/${myCategoria.id}`)
          .expect(200);
        expect(() => {
          expect(body).toEqual(myCategoria);
          expect(mockCategoriasService.findOne).toHaveBeenCalled();
        });
      });

      it('Devuelve notfound', async () => {
        mockCategoriasService.findOne.mockRejectedValue(
          new NotFoundException(),
        );

        await request(app.getHttpServer())
          .get(`${myEndpoint}/${myCategoria.id}`)
          .expect(404);
      });
    });
    describe('POST /categorias', () => {
      it('Devuelve categoria creada', async () => {
        mockCategoriasService.create.mockResolvedValue(myCategoria);

        const { body } = await request(app.getHttpServer())
          .post(myEndpoint)
          .send(createCategoriaDto)
          .expect(201);
        expect(() => {
          expect(body).toEqual(myCategoria);
          expect(mockCategoriasService.create).toHaveBeenCalledWith(
            createCategoriaDto,
          );
        });
      });
      it('Devuelve BadRequest', async () => {
        const errorMessage = 'El nombre de la categoría ya existe';
        mockCategoriasService.create.mockRejectedValue(
          new BadRequestException(errorMessage),
        );

        const { body } = await request(app.getHttpServer())
          .post(myEndpoint)
          .send(createCategoriaDto)
          .expect(400);

        expect(() => {
          expect(body).toEqual({ message: errorMessage, statusCode: 400 });
          expect(mockCategoriasService.create).toHaveBeenCalledWith(
            createCategoriaDto,
          );
        });
      });
    });
    describe('PUT /categorias/:id', () => {
      it('Devuelve categoria actualizada', async () => {
        mockCategoriasService.update.mockResolvedValue(myCategoria);

        const { body } = await request(app.getHttpServer())
          .put(`${myEndpoint}/${myCategoria.id}`)
          .send(updateCategoriaDto)
          .expect(200);
        expect(() => {
          expect(body).toEqual(myCategoria);
          expect(mockCategoriasService.update).toHaveBeenCalledWith(
            myCategoria.id,
            updateCategoriaDto,
          );
        });
      });

      it('Devuelve BadRequest', async () => {
        const errorMessage = 'Error al actualizar la categoría';
        mockCategoriasService.update.mockRejectedValue(
          new BadRequestException(errorMessage),
        );

        const { body } = await request(app.getHttpServer())
          .put(`${myEndpoint}/${myCategoria.id}`)
          .send(updateCategoriaDto)
          .expect(400);

        expect(() => {
          expect(body).toEqual({ message: errorMessage, statusCode: 400 });
          expect(mockCategoriasService.update).toHaveBeenCalledWith(
            myCategoria.id,
            updateCategoriaDto,
          );
        });
      });

      it('Devuelve NotFound', async () => {
        mockCategoriasService.update.mockRejectedValue(new NotFoundException());
        await request(app.getHttpServer())
          .put(`${myEndpoint}/${myCategoria.id}`)
          .send(updateCategoriaDto)
          .expect(404);
      });
    });
    describe('DELETE /categorias/:id', () => {
      it('Elimina categoria', async () => {
        mockCategoriasService.remove.mockResolvedValue(myCategoria);

        await request(app.getHttpServer())
          .delete(`${myEndpoint}/${myCategoria.id}`)
          .expect(204);
      });

      it('Devuelve NotFound', async () => {
        mockCategoriasService.removeSoft.mockRejectedValue(
          new NotFoundException(),
        );
        await request(app.getHttpServer())
          .delete(`${myEndpoint}/${myCategoria.id}`)
          .expect(404);
      });
    });
  });
});
