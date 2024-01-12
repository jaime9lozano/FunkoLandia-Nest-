import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { FunkoService } from '../funko.service';
import { funkoExistGuard } from './funko-exist.guard';

describe('FunkoExistGuard', () => {
  let funkoGuard: funkoExistGuard;
  let mockFunkoService: Partial<FunkoService>;

  beforeEach(async () => {
    mockFunkoService = {
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        funkoExistGuard,
        { provide: FunkoService, useValue: mockFunkoService },
      ],
    }).compile();

    funkoGuard = module.get<funkoExistGuard>(funkoExistGuard);
  });

  it('should be defined', () => {
    expect(funkoExistGuard).toBeDefined();
  });

  describe('GuardFunkoID', () => {
    it('True, Funko existe', async () => {
      // Arrange
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { id: '1' },
          }),
        }),
      } as any;

      (mockFunkoService.exists as jest.Mock).mockImplementationOnce(
        (id: number) =>
          Promise.resolve({
            id: id,
          }),
      );

      // Act
      const result = await funkoGuard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('NotFound si el ID no existe', async () => {
      // Arrange
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            params: { id: '1' },
          }),
        }),
      } as any;

      (mockFunkoService.exists as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve(null),
      );

      // Act & Assert
      await expect(
        funkoGuard.canActivate(mockExecutionContext),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
