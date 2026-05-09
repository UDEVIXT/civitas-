import { Test, TestingModule } from '@nestjs/testing';
import { EvidenciaIncidenciaController } from './evidencia-incidencia.controller';
import { EvidenciaIncidenciaService } from './evidencia-incidencia.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvidenciaIncidenciaController', () => {
  let controller: EvidenciaIncidenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenciaIncidenciaController],
      providers: [
              EvidenciaIncidenciaService,
            {
                      provide: PrismaService,
                      useValue: {},
                    }
                  ]
    }).compile();

    controller = module.get<EvidenciaIncidenciaController>(EvidenciaIncidenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
