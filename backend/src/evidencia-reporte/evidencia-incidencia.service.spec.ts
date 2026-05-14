import { Test, TestingModule } from '@nestjs/testing';
import { EvidenciaReporteService } from './evidencia-incidencia.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvidenciaReporteService', () => {
  let service: EvidenciaReporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenciaReporteService,
      {
                provide: PrismaService,
                useValue: {},
              }
            ]
    }).compile();

    service = module.get<EvidenciaReporteService>(EvidenciaReporteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
