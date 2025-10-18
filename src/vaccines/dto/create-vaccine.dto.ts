import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVaccineDto {
  @ApiProperty({
    description: 'ID do pet (ObjectId)',
    example: '66f1d9d1c6a7bcf0b1a9c123',
  })
  @IsMongoId()
  pet: string;

  @ApiProperty({ example: 'V10' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Zoetis' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  manufacturer?: string;

  @ApiPropertyOptional({ example: 'Lote ABC123' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  batch?: string;

  @ApiPropertyOptional({ example: 1.5, description: 'Dose em mL' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  doseMl?: number;

  @ApiPropertyOptional({ example: 'SC', enum: ['SC', 'IM', 'Oral', 'Nasal'] })
  @IsOptional()
  @IsString()
  route?: 'SC' | 'IM' | 'Oral' | 'Nasal';

  @ApiPropertyOptional({ example: '2025-10-13T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @ApiPropertyOptional({ example: '2025-11-13T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  nextDoseAt?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 'Dra. Marina K.' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  veterinarian?: string;

  @ApiPropertyOptional({ example: 'Sem reações adversas.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
