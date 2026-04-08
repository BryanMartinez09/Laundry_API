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
  passwordHash: string; // In a real app we receive 'password' and hash it in service

  @IsString()
  @IsOptional()
  initials?: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
