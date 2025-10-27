import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentPlan } from './entities/treatment_plan.entity';
import { TreatmentProcedure } from './entities/treatment_procedure.entity';
import { CreateTreatmentPlanDto } from './dto/create-treatment_plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment_plan.dto';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class TreatmentPlansService {
  constructor(
    @InjectRepository(TreatmentPlan)
    private readonly planRepository: Repository<TreatmentPlan>,
    @InjectRepository(TreatmentProcedure)
    private readonly procedureRepository: Repository<TreatmentProcedure>, // <-- agregado
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createDto: CreateTreatmentPlanDto): Promise<TreatmentPlan> {
    // Separamos los procedimientos del resto del DTO
    const { procedures = [], ...planDto } = createDto;

    const patient = await this.patientRepository.findOne({
      where: { id: planDto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    console.log('Creating treatment plan with procedures:', createDto);

    // Creamos la entidad del plan
    const plan = this.planRepository.create({
      ...planDto,
      patient,
    });

    // Si vienen procedimientos, los transformamos y asignamos
    if (procedures.length) {
      const procs = procedures.map((procDto) => {
        const p = this.procedureRepository.create(procDto);
        p.plan = plan;
        return p;
      });
      await this.procedureRepository.save(procs);
    }

    // Guardamos todo de una
    return await this.planRepository.save(plan);
  }

  async findAll(): Promise<TreatmentPlan[]> {
    return this.planRepository.find({ relations: ['patient'] });
  }

  async findOne(id: string): Promise<TreatmentPlan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['patient'],
    });
    if (!plan) throw new NotFoundException(`TreatmentPlan ${id} not found`);
    return plan;
  }

  async update(
    id: string,
    updateDto: UpdateTreatmentPlanDto,
  ): Promise<TreatmentPlan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updateDto);
    return this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const result = await this.planRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`TreatmentPlan ${id} not found`);
  }
}
