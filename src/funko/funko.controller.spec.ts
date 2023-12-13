import { Test, TestingModule } from '@nestjs/testing';
import { FunkoController } from './funko.controller';
import { FunkoService } from './funko.service';

describe('FunkoController', () => {
  let controller: FunkoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FunkoController],
      providers: [FunkoService],
    }).compile();

    controller = module.get<FunkoController>(FunkoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
