import { Test, TestingModule } from '@nestjs/testing';
import { EvidenciaReporteController } from './evidencia-incidencia.controller';
import { EvidenciaReporteService } from './evidencia-incidencia.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvidenciaReporteController', () => {
  let controller: EvidenciaReporteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenciaReporteController],
      providers: [
              EvidenciaReporteService,
            {
                      provide: PrismaService,
                      useValue: {},
                    }
                  ]
    }).compile();

    controller = module.get<EvidenciaReporteController>(EvidenciaReporteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
