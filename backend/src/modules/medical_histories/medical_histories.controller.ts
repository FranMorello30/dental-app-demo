import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MedicalHistoriesService } from './medical_histories.service';
import { CreateMedicalHistoryDto } from './dto/create-medical_history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical_history.dto';
import { CreateTreatmentTeethDto } from './dto/create-treatment_teeth.dto';
import { UpdateTreatmentTeethDto } from './dto/update-treatment_teeth.dto';

@Controller('medical-histories')
export class MedicalHistoriesController {
  constructor(
    private readonly medicalHistoriesService: MedicalHistoriesService,
  ) {}

  @Post()
  create(@Body() createMedicalHistoryDto: CreateMedicalHistoryDto) {
    return this.medicalHistoriesService.create(createMedicalHistoryDto);
  }

  @Get()
  findAll() {
    return this.medicalHistoriesService.findAll();
  }

  @Post('treatment-teeth')
  createTreatmentTeeth(@Body() dto: CreateTreatmentTeethDto) {
    return this.medicalHistoriesService.createTreatmentTeeth(dto);
  }

  @Get('treatment-teeth')
  findAllTreatmentTeeth() {
    return this.medicalHistoriesService.findAllTreatmentTeeth();
  }

  @Get('treatment-teeth/:id')
  findTreatmentTeeth(@Param('id') id: string) {
    return this.medicalHistoriesService.findTreatmentTeeth(id);
  }

  @Patch('treatment-teeth/:id')
  updateTreatmentTeeth(
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentTeethDto,
  ) {
    return this.medicalHistoriesService.updateTreatmentTeeth(id, dto);
  }

  @Delete('treatment-teeth/:id')
  removeTreatmentTeeth(@Param('id') id: string) {
    return this.medicalHistoriesService.removeTreatmentTeeth(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalHistoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalHistoryDto: UpdateMedicalHistoryDto,
  ) {
    return this.medicalHistoriesService.update(+id, updateMedicalHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalHistoriesService.remove(+id);
  }
}
