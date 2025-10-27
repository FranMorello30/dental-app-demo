import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentPlansController } from './treatment_plans.controller';
import { TreatmentPlansService } from './treatment_plans.service';

describe('TreatmentPlansController', () => {
  let controller: TreatmentPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreatmentPlansController],
      providers: [TreatmentPlansService],
    }).compile();

    controller = module.get<TreatmentPlansController>(TreatmentPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
