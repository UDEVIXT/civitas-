import { Test, TestingModule } from '@nestjs/testing';
import { BitacoraService } from './bitacora.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BitacoraService', () => {
  let service: BitacoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BitacoraService,
        {
          provide: PrismaService,
          useValue: {
            bitacora: {},
            bitacoraQrVisitante: {},
            guardia: {},
          },
        },
      ],
    }).compile();

    service = module.get<BitacoraService>(BitacoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
