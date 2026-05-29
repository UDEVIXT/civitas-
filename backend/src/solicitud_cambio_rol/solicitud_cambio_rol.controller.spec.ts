import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudCambioRolController } from './solicitud_cambio_rol.controller';
import { SolicitudCambioRolService } from './solicitud_cambio_rol.service';

describe('SolicitudCambioRolController', () => {
  let controller: SolicitudCambioRolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudCambioRolController],
      providers: [SolicitudCambioRolService],
    }).compile();

    controller = module.get<SolicitudCambioRolController>(SolicitudCambioRolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
