import { Test, TestingModule } from '@nestjs/testing';
import { MedicalHistoriesController } from './medical_histories.controller';
import { MedicalHistoriesService } from './medical_histories.service';

describe('MedicalHistoriesController', () => {
  let controller: MedicalHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalHistoriesController],
      providers: [MedicalHistoriesService],
    }).compile();

    controller = module.get<MedicalHistoriesController>(MedicalHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
