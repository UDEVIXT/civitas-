import { Test, TestingModule } from '@nestjs/testing';
import { EvidenciaIncidenciaService } from './evidencia-incidencia.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvidenciaIncidenciaService', () => {
  let service: EvidenciaIncidenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenciaIncidenciaService,
      {
                provide: PrismaService,
                useValue: {},
              }
            ]
    }).compile();

    service = module.get<EvidenciaIncidenciaService>(EvidenciaIncidenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
