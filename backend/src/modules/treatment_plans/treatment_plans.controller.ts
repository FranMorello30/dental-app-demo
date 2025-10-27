import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { TreatmentPlansService } from './treatment_plans.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment_plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment_plan.dto';

@Controller('treatment-plans')
@UseInterceptors(ClassSerializerInterceptor)
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Post()
  create(@Body() createTreatmentPlanDto: CreateTreatmentPlanDto) {
    return this.treatmentPlansService.create(createTreatmentPlanDto);
  }

  @Get()
  findAll() {
    return this.treatmentPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treatmentPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTreatmentPlanDto: UpdateTreatmentPlanDto,
  ) {
    return this.treatmentPlansService.update(id, updateTreatmentPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentPlansService.remove(id);
  }
}
