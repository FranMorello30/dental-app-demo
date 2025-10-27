import { Module } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from './entities/treatment.entity';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  imports: [TypeOrmModule.forFeature([Treatment])],
})
export class TreatmentsModule {}
