import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadoService } from './empleado.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmpleadoService', () => {
  let service: EmpleadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadoService,
        {
          provide: PrismaService,
          useValue: {
            visitante: {},
            servicio: {},
          },
        },
      ],
    }).compile();

    service = module.get<EmpleadoService>(EmpleadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
