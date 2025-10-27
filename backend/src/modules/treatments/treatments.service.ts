import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment } from './entities/treatment.entity';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
  ) {}

  async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    const treatment = this.treatmentRepository.create(createTreatmentDto);
    return await this.treatmentRepository.save(treatment);
  }

  async findAll(): Promise<{ treatments: Treatment[] }> {
    const treatments = await this.treatmentRepository.find({
      order: { name: 'ASC' },
    });
    return { treatments };
  }

  async findOne(id: string): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({ where: { id } });
    if (!treatment) {
      throw new NotFoundException(`Treatment with id ${id} not found`);
    }
    return treatment;
  }

  async update(
    id: string,
    updateTreatmentDto: UpdateTreatmentDto,
  ): Promise<Treatment> {
    const treatment = await this.findOne(id);
    Object.assign(treatment, updateTreatmentDto);
    return await this.treatmentRepository.save(treatment);
  }

  async remove(id: string): Promise<void> {
    const treatment = await this.findOne(id);
    await this.treatmentRepository.remove(treatment);
  }
}
