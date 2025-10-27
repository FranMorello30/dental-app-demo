import { Module } from '@nestjs/common';
import { OdontologosService } from './odontologos.service';
import { OdontologosController } from './odontologos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Dentist } from './entities/dentist.entity';
import { DentistSchedule } from './entities/dentist-schedules.entity';

import { DentistBreak } from './entities/dentist-breaks.entity';
import { DentistUnavailability } from './entities/dentist-unavailabilities.entity';

@Module({
  controllers: [OdontologosController],
  providers: [OdontologosService],
  imports: [
    TypeOrmModule.forFeature([
      Dentist,

      DentistBreak,
      DentistSchedule,

      DentistUnavailability,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class OdontologosModule {}
