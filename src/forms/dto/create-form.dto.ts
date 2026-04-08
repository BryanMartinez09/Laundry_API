import {
  IsDateString, IsInt, IsOptional, IsString,
  IsUUID, IsArray, ValidateNested, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFormSectionDto } from './create-form-section.dto';

export class CreateFormDto {
  @IsUUID()
  companyId: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  pocketCount?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  plasticBagsSmall?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  plasticBagsLarge?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormSectionDto)
  sections: CreateFormSectionDto[];
}
