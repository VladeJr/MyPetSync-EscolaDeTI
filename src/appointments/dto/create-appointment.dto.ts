import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional()
  @IsMongoId()
  pet: string;

  @ApiProperty({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsOptional()
  @IsMongoId()
  provider: string;

  @ApiProperty({ example: '2025-10-25T14:30:00.000Z' })
  @IsDateString()
  dateTime: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;

  @ApiPropertyOptional({ example: 'Consulta de rotina' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;

  @ApiPropertyOptional({ example: 'Clínica Vet Central' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    enum: ['scheduled', 'completed', 'canceled'],
    example: 'scheduled',
  })
  @IsOptional()
  @IsEnum(['scheduled', 'completed', 'canceled'])
  status?: 'scheduled' | 'completed' | 'canceled';

  @ApiPropertyOptional({ example: 'Ayres recomenda retorno em 30 dias' })
  @IsOptional()
  @IsString()
  notes?: string;
}
