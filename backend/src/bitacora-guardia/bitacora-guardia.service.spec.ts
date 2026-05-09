import { Test, TestingModule } from '@nestjs/testing';
import { BitacoraGuardiaService } from './bitacora-guardia.service';

describe('BitacoraGuardiaService', () => {
  let service: BitacoraGuardiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitacoraGuardiaService],
    }).compile();

    service = module.get<BitacoraGuardiaService>(BitacoraGuardiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
