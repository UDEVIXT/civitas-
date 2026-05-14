import { Test, TestingModule } from '@nestjs/testing';
import { ResidenteService } from './residente.service';

describe('ResidenteService', () => {
  let service: ResidenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidenteService],
    }).compile();

    service = module.get<ResidenteService>(ResidenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
