import { Test, TestingModule } from '@nestjs/testing';
import { ViviendaController } from './vivienda.controller';
import { ViviendaService } from './vivienda.service';

describe('ViviendaController', () => {
  let controller: ViviendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViviendaController],
      providers: [ViviendaService],
    }).compile();

    controller = module.get<ViviendaController>(ViviendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
