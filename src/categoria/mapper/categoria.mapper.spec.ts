import { CategoriasMapper } from './categoria.mapper';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';

describe('CategoriasMapper', () => {
  let categoriasMapper: CategoriasMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasMapper],
    }).compile();

    categoriasMapper = module.get<CategoriasMapper>(CategoriasMapper);
  });

  it('should be defined', () => {
    expect(categoriasMapper).toBeDefined();
  });
  describe('toCategoriaNew', () => {
    it('Map CreateDtoCategoria a Categoria', () => {
      // Arrange
      const createCategoriaDto: CreateCategoriaDto = {
        categoria: 'CategoriaName',
      };

      // Act
      const result = categoriasMapper.toCategoriaNew(createCategoriaDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.productos).toEqual([]);
      expect(result.id).toBeDefined();
      expect(result.categoria).toBe('categorianame');
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.is_deleted).toBe(false);
    });
  });

  describe('toCategoriaUpdate', () => {
    it('Map UpdateDtoCategoria a Categoria', () => {
      // Arrange
      const updateCategoriaDto: UpdateCategoriaDto = {
        // ... update properties
      };

      const existingCategoria = {
        id: 'existing-id',
        categoria: 'ExistingCategoria',
        productos: [],
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      // Act
      const result = categoriasMapper.toCategoriaUpdate(
        updateCategoriaDto,
        existingCategoria,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(existingCategoria.id);
      expect(result.categoria).toBe('existingcategoria');
      expect(result.productos).toEqual(existingCategoria.productos);
      expect(result.created_at).toBe(existingCategoria.created_at);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.is_deleted).toBe(existingCategoria.is_deleted);
    });
  });
});
