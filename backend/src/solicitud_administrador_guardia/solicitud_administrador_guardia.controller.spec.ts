import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAdministradorGuardiaController } from './solicitud_administrador_guardia.controller';
import { SolicitudAdministradorGuardiaService } from './solicitud_administrador_guardia.service';

describe('SolicitudAdministradorGuardiaController', () => {
  let controller: SolicitudAdministradorGuardiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudAdministradorGuardiaController],
      providers: [SolicitudAdministradorGuardiaService],
    }).compile();

    controller = module.get<SolicitudAdministradorGuardiaController>(SolicitudAdministradorGuardiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
