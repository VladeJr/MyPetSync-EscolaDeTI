import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsMongoId()
  pet: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsOptional() @IsMongoId()
  appointment?: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9c999' })
  @IsOptional() @IsMongoId()
  provider?: string;

  @ApiProperty({ example: 'Hemograma Completo' })
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'sangue' })
  @IsOptional() @IsString() @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ enum: ['requested','collected','ready','canceled'], example: 'requested' })
  @IsOptional() @IsEnum(['requested','collected','ready','canceled'])
  status?: 'requested' | 'collected' | 'ready' | 'canceled';

  @ApiPropertyOptional({ example: '2025-10-22T10:00:00.000Z' })
  @IsOptional() @IsDateString()
  requestedAt?: string;

  @ApiPropertyOptional({ example: '2025-10-23T10:00:00.000Z' })
  @IsOptional() @IsDateString()
  collectedAt?: string;

  @ApiPropertyOptional({ example: '2025-10-24T10:00:00.000Z' })
  @IsOptional() @IsDateString()
  resultAt?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'LabVet Central' })
  @IsOptional() @IsString() @MaxLength(120)
  labName?: string;

  @ApiPropertyOptional({ example: 'https://meu-storage/exams/hemograma-123.pdf' })
  @IsOptional() @IsString()
  resultUrl?: string;

  @ApiPropertyOptional({ example: 'Resultados dentro da normalidade.' })
  @IsOptional() @IsString()
  resultText?: string;

  @ApiPropertyOptional({ example: 'Coleta às 8h em jejum.' })
  @IsOptional() @IsString()
  notes?: string;
}
