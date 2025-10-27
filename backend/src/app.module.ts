import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';

import { OdontologosModule } from './modules/odontologos/odontologos.module';

import { TreatmentsModule } from './modules/treatments/treatments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalHistoriesModule } from './modules/medical_histories/medical_histories.module';
import { TreatmentPlansModule } from './modules/treatment_plans/treatment_plans.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      async useFactory(config: ConfigService) {
        return {
          type: 'mysql',
          host: config.get('DB_HOST'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    AuthModule,
    AppointmentsModule,
    //ClientesModule,
    //HistoryModule,
    //CitaModule,
    //InventarioModule,
    //FacturacionModule,
    MedicalHistoriesModule,
    OdontologosModule,
    PatientsModule,
    SpecialtiesModule,
    TreatmentsModule,
    TreatmentPlansModule,
    //DefinicionesModule,

    //ReservacionesModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule {}
