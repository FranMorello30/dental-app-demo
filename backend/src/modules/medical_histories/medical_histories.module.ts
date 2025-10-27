import { Module } from '@nestjs/common';
import { MedicalHistoriesService } from './medical_histories.service';
import { MedicalHistoriesController } from './medical_histories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from './entities/medical_history.entity';
import { MedicalAttachment } from './entities/medical_attachment.entity';
import { TreatedTeeth } from './entities/treated_teeth.entity';

@Module({
  controllers: [MedicalHistoriesController],
  providers: [MedicalHistoriesService],
  imports: [
    TypeOrmModule.forFeature([MedicalHistory, MedicalAttachment, TreatedTeeth]),
    // OdontologosModule,
    // PatientsModule,
  ],
})
export class MedicalHistoriesModule {}
