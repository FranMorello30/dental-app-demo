import { CreateMedicalHistoryDto } from './dto/create-medical_history.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { MedicalHistory } from './entities/medical_history.entity';
import { TreatedTeeth } from './entities/treated_teeth.entity';
import { MedicalAttachment } from './entities/medical_attachment.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { TreatmentTeeth } from './entities/treatment_teeth.entity';
import { CreateTreatmentTeethDto } from './dto/create-treatment_teeth.dto';
import { UpdateTreatmentTeethDto } from './dto/update-treatment_teeth.dto';

@Injectable()
export class MedicalHistoriesService {
  constructor(
    @InjectRepository(MedicalHistory)
    private readonly medicalHistoryRepository: Repository<MedicalHistory>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(TreatmentTeeth)
    private readonly treatmentTeethRepository: Repository<TreatmentTeeth>,
  ) {}

  async create(createMedicalHistoryDto: CreateMedicalHistoryDto) {
    const { teeth, attachments, appointmentId, ...historyData } =
      createMedicalHistoryDto;

    // Create related entities
    const treatedTeeth: DeepPartial<TreatedTeeth>[] = [];
    if (teeth && teeth.length > 0) {
      teeth.forEach((tooth) => {
        treatedTeeth.push({
          tooth_number: tooth.tooth_number,
          treatment: tooth.treatment,
        });
      });
    }

    const medAttachments: DeepPartial<MedicalAttachment>[] = [];
    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        medAttachments.push({
          name: file.nombre,
          // original_name: file.nombreOriginal, // Check entity if fields match
          file_type: 'unknown',
          file_path: file.ruta,
          file_size: file.size,
        });
      });
    }

    // Create main entity
    const medicalHistory = this.medicalHistoryRepository.create({
      ...historyData,
      notes: historyData.notes ?? '', // Ensure notes is string
      dentist: { id: historyData.dentistId },
      patient: { id: historyData.patientId },
      appointment: appointmentId
        ? ({ id: appointmentId } as Appointment)
        : undefined,
      treated_teeth: treatedTeeth,
      attachments: medAttachments,
    });

    const savedHistory =
      await this.medicalHistoryRepository.save(medicalHistory);

    // If linked to an appointment, close it
    if (appointmentId) {
      await this.appointmentRepository.update(appointmentId, {
        status: () => `'Finalizada'`,
      });
    }

    return savedHistory;
  }

  findAll() {
    return this.medicalHistoryRepository.find({
      relations: ['dentist', 'patient', 'treated_teeth', 'attachments'],
      where: { is_deleted: false },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} medicalHistory`;
  }

  update(id: number, updateMedicalHistoryDto: any) {
    return `This action updates a #${id} medicalHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalHistory`;
  }

  async createTreatmentTeeth(
    dto: CreateTreatmentTeethDto,
  ): Promise<TreatmentTeeth> {
    const treatmentTeeth = this.treatmentTeethRepository.create({
      color: dto.color,
      treatment: dto.treatment,
    });

    return this.treatmentTeethRepository.save(treatmentTeeth);
  }

  async findAllTreatmentTeeth(): Promise<{
    treatment_teeth: TreatmentTeeth[];
  }> {
    const treatment_teeth = await this.treatmentTeethRepository.find({
      where: { is_deleted: false },
    });
    return { treatment_teeth };
  }

  async findTreatmentTeeth(id: string): Promise<TreatmentTeeth> {
    const treatmentTeeth = await this.treatmentTeethRepository.findOne({
      where: { id, is_deleted: false },
    });
    if (!treatmentTeeth)
      throw new NotFoundException('TreatmentTeeth not found');
    return treatmentTeeth;
  }

  async updateTreatmentTeeth(
    id: string,
    dto: UpdateTreatmentTeethDto,
  ): Promise<TreatmentTeeth> {
    const treatmentTeeth = await this.findTreatmentTeeth(id);

    if (dto.color !== undefined) treatmentTeeth.color = dto.color;
    if (dto.treatment !== undefined) treatmentTeeth.treatment = dto.treatment;

    return this.treatmentTeethRepository.save(treatmentTeeth);
  }

  async removeTreatmentTeeth(id: string): Promise<void> {
    const treatmentTeeth = await this.findTreatmentTeeth(id);
    treatmentTeeth.is_deleted = true;
    await this.treatmentTeethRepository.save(treatmentTeeth);
  }
}
