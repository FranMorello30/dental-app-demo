import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';

@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  async create(@Body() createTreatmentDto: CreateTreatmentDto) {
    return await this.treatmentsService.create(createTreatmentDto);
  }

  @Get()
  async findAll() {
    return await this.treatmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.treatmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return await this.treatmentsService.update(id, updateTreatmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.treatmentsService.remove(id);
    return { message: 'Treatment deleted successfully' };
  }
}
