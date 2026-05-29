import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudCambioRolService } from './solicitud_cambio_rol.service';

describe('SolicitudCambioRolService', () => {
  let service: SolicitudCambioRolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudCambioRolService],
    }).compile();

    service = module.get<SolicitudCambioRolService>(SolicitudCambioRolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
