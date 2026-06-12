import { Test, TestingModule } from '@nestjs/testing';
import { AccesoPreautorizadoController } from './acceso-preautorizado.controller';
import { AccesoPreautorizadoService } from './acceso-preautorizado.service';

describe('AccesoPreautorizadoController', () => {
  let controller: AccesoPreautorizadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccesoPreautorizadoController],
      providers: [AccesoPreautorizadoService],
    }).compile();

    controller = module.get<AccesoPreautorizadoController>(AccesoPreautorizadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
