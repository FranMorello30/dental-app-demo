import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalAlert } from './entities/medical_alert.entity';
import { Habit } from './entities/habit.entity';
import { PatientAttachment } from './entities/patient_attachment.entity';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService],
  imports: [
    TypeOrmModule.forFeature([Patient, MedicalAlert, Habit, PatientAttachment]),
  ],
  exports: [TypeOrmModule],
})
export class PatientsModule {}
