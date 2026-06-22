import { Test, TestingModule } from '@nestjs/testing';
import { AccesoPreautorizadoService } from './acceso-preautorizado.service';

describe('AccesoPreautorizadoService', () => {
  let service: AccesoPreautorizadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccesoPreautorizadoService],
    }).compile();

    service = module.get<AccesoPreautorizadoService>(AccesoPreautorizadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
