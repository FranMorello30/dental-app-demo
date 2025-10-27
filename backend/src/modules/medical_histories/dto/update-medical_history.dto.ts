import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalHistoryDto } from './create-medical_history.dto';

export class UpdateMedicalHistoryDto extends PartialType(CreateMedicalHistoryDto) {}
