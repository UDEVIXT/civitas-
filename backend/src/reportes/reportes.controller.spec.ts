import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportesController', () => {
  let controller: ReportesController;

  beforeEach(async () => {
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [
            ReportesService,
            {
              provide: PrismaService,
              useValue: {},
            },
          ],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
