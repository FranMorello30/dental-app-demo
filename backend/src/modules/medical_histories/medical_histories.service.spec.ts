import { Test, TestingModule } from '@nestjs/testing';
import { MedicalHistoriesService } from './medical_histories.service';

describe('MedicalHistoriesService', () => {
  let service: MedicalHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalHistoriesService],
    }).compile();

    service = module.get<MedicalHistoriesService>(MedicalHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
