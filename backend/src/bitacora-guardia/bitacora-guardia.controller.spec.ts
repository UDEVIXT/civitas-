import { Test, TestingModule } from '@nestjs/testing';
import { BitacoraGuardiaController } from './bitacora-guardia.controller';
import { BitacoraGuardiaService } from './bitacora-guardia.service';

describe('BitacoraGuardiaController', () => {
  let controller: BitacoraGuardiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BitacoraGuardiaController],
      providers: [BitacoraGuardiaService],
    }).compile();

    controller = module.get<BitacoraGuardiaController>(BitacoraGuardiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
