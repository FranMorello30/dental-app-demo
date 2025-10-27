import { Module } from '@nestjs/common';
import { TreatmentPlansService } from './treatment_plans.service';
import { TreatmentPlansController } from './treatment_plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentPlan } from './entities/treatment_plan.entity';
import { TreatmentProcedure } from './entities/treatment_procedure.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  controllers: [TreatmentPlansController],
  providers: [TreatmentPlansService],
  imports: [
    TypeOrmModule.forFeature([TreatmentPlan, TreatmentProcedure]),
    PatientsModule,
  ],
})
export class TreatmentPlansModule {}
