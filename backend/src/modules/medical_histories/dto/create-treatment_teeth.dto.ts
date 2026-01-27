import { IsString, IsUUID } from 'class-validator';

export class CreateTreatmentTeethDto {
  //   @IsUUID()
  //   medicalHistoryId: string;

  @IsString()
  color: string;

  @IsString()
  treatment: string;
}
