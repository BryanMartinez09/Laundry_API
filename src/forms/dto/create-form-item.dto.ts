import {
  IsString, IsOptional, IsInt, IsUUID,
  IsEnum, IsBoolean, Min, ValidateNested, IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemSize } from '../entities/form-item.entity';

export class CreateFormItemDto {
  @IsString()
  category: string;

  @IsEnum(ItemSize)
  @IsOptional()
  size?: ItemSize;

  @IsBoolean()
  @IsOptional()
  isColored?: boolean;

  @IsInt()
  @Min(0)
  quantity: number;
}
