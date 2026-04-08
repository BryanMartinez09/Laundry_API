import {
  IsEnum, IsOptional, IsString, IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SectionName } from '../entities/form-section.entity';
import { CreateFormItemDto } from './create-form-item.dto';

export class CreateFormSectionDto {
  @IsEnum(SectionName)
  sectionName: SectionName;

  @IsString()
  @IsOptional()
  filledByInitials?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormItemDto)
  items: CreateFormItemDto[];
}
