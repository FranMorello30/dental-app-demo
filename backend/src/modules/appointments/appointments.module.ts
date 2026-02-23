import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { OdontologosModule } from '../odontologos/odontologos.module';
import { PatientsModule } from '../patients/patients.module';
import { SocketModule } from 'src/socket/socket-ws.module';
import { TreatmentProcedure } from '../treatment_plans/entities/treatment_procedure.entity';
import { TreatmentPlan } from '../treatment_plans/entities/treatment_plan.entity';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment, TreatmentProcedure, TreatmentPlan]),
    OdontologosModule,
    PatientsModule,
    SocketModule,
  ],
})
export class AppointmentsModule {}
