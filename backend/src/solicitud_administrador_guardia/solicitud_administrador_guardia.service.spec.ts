import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAdministradorGuardiaService } from './solicitud_administrador_guardia.service';

describe('SolicitudAdministradorGuardiaService', () => {
  let service: SolicitudAdministradorGuardiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudAdministradorGuardiaService],
    }).compile();

    service = module.get<SolicitudAdministradorGuardiaService>(SolicitudAdministradorGuardiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
