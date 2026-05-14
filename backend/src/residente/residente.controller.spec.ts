import { Test, TestingModule } from '@nestjs/testing';
import { ResidenteController } from './residente.controller';
import { ResidenteService } from './residente.service';

describe('ResidenteController', () => {
  let controller: ResidenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidenteController],
      providers: [ResidenteService],
    }).compile();

    controller = module.get<ResidenteController>(ResidenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
