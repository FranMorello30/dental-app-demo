import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RolDto {

  @IsString()
  rol: string;

}
