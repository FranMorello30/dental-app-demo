import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<Specialty> {
    const specialty = this.specialtyRepository.create(createSpecialtyDto);
    return this.specialtyRepository.save(specialty);
  }

  async findAll(): Promise<Specialty[]> {
    return this.specialtyRepository.find();
  }

  async findOne(id: string): Promise<Specialty> {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty) throw new NotFoundException(`Specialty #${id} not found`);
    return specialty;
  }

  async update(
    id: string,
    updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<Specialty> {
    const specialty = await this.findOne(id);
    Object.assign(specialty, updateSpecialtyDto);
    return this.specialtyRepository.save(specialty);
  }

  async remove(id: string): Promise<void> {
    const specialty = await this.findOne(id);
    await this.specialtyRepository.remove(specialty);
  }
}
