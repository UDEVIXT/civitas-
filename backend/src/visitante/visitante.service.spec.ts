import { Test, TestingModule } from '@nestjs/testing';
import { VisitanteService } from './visitante.service';
import { PrismaService } from '../prisma/prisma.service';
import { ArchivosService } from '../r2-module/archivos.service';

describe('VisitanteService', () => {
  let service: VisitanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitanteService,
        {
          provide: PrismaService,
          useValue: {
            visitante: {},
            residente: {},
            acceso: {},
          },
        },
        {
          provide: ArchivosService,
          useValue: {
            subirImagen: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VisitanteService>(VisitanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
