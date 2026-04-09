import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string; // Recibimos el password en texto plano y lo hasheamos en el controlador

  @IsString()
  @IsOptional()
  initials?: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
