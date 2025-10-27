import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { OdontologosModule } from '../odontologos/odontologos.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    OdontologosModule,
    PatientsModule,
  ],
})
export class AppointmentsModule {}
