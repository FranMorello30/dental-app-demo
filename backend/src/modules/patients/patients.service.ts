import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { MedicalAlert } from './entities/medical_alert.entity';
import { PatientAttachment } from './entities/patient_attachment.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { habits, history, attachments, ...patientData } = createPatientDto;

    // Map history DTO to MedicalAlert entities
    const medicalAlerts: DeepPartial<MedicalAlert>[] = [];
    if (history) {
      if (history.allergies) {
        medicalAlerts.push(
          this.createAlertObject('Alergia', history.allergies),
        );
      }
      if (history.medications) {
        medicalAlerts.push(
          this.createAlertObject('Medicamento', history.medications),
        );
      }
      if (history.illnesses) {
        medicalAlerts.push(
          this.createAlertObject('Enfermedad', history.illnesses),
        );
      }
    }

    // Map attachments DTO to PatientAttachment entities
    const patientAttachments: DeepPartial<PatientAttachment>[] = [];
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        patientAttachments.push({
          filename: file.nombre,
          original_name: file.nombreOriginal,
          size: file.size,
          path: file.ruta,
        });
      }
    }

    const patient = this.patientRepository.create({
      ...patientData,
      habit: habits,
      medical_alerts: medicalAlerts,
      attachments: patientAttachments,
    });
    return this.patientRepository.save(patient);
  }

  private createAlertObject(type: string, description: string) {
    return {
      type,
      description,
      severity: 'Medium', // Default severity
    };
  }

  async findAll(): Promise<{ patients: Patient[] }> {
    const patients = await this.patientRepository.find({
      where: { is_deleted: false },
    });
    return { patients };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, is_deleted: false },
    });
    if (!patient) throw new NotFoundException(`Patient #${id} not found`);
    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    patient.is_deleted = true;
    await this.patientRepository.save(patient);
  }
}
