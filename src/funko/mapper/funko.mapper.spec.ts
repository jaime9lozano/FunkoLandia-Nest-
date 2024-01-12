import { FunkoMapper } from './funko.mapper';
import { Test, TestingModule } from '@nestjs/testing';

describe('FunkosMapper', () => {
  let funkoMapper: FunkoMapper;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoMapper],
    }).compile();

    funkoMapper = module.get<FunkoMapper>(FunkoMapper);
  });

  it('should be defined', () => {
    expect(funkoMapper).toBeDefined();
  });
  describe('toFunko', () => {
    it('Map CreateFunko y Categoria a Funko', () => {
      // Arrange
      const createFunkoDto = {
        nombre: 'FunkoName',
        precio: 10,
        cantidad: 5,
        imagen: 'imagen',
        categoria: 'CategoriaName',
      };

      const categoria = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        categoria: 'CategoriaName',
        productos: [],
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      // Act
      const result = funkoMapper.toFunko(createFunkoDto, categoria);

      // Assert
      expect(result).toBeDefined();
      expect(result.nombre).toBe('funkoname');
      expect(result.categoria).toBe(categoria);
    });
  });

  describe('toResponse', () => {
    it('Map funko a funkoResponse', () => {
      // Arrange
      const funko = {
        nombre: 'FunkoName',
        categoria: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          categoria: 'CategoriaName',
          productos: [],
          created_at: new Date(),
          updated_at: new Date(),
          is_deleted: false,
        },
        created_at: new Date(),
        updated_at: new Date(),
        id: 1,
        precio: 10,
        cantidad: 5,
        imagen: 'imagen',
        is_deleted: false,
      };

      // Act
      const result = funkoMapper.toResponse(funko);

      // Assert
      expect(result).toBeDefined();
      expect(result.nombre).toBe('funkoname');
      expect(result.categoria).toBe('categorianame');
    });
  });
});
