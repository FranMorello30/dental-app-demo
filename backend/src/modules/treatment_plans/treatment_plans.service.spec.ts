import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentPlansService } from './treatment_plans.service';

describe('TreatmentPlansService', () => {
  let service: TreatmentPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreatmentPlansService],
    }).compile();

    service = module.get<TreatmentPlansService>(TreatmentPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
