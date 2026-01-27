import { PartialType } from '@nestjs/mapped-types';
import { CreateTreatmentTeethDto } from './create-treatment_teeth.dto';

export class UpdateTreatmentTeethDto extends PartialType(
  CreateTreatmentTeethDto,
) {}
