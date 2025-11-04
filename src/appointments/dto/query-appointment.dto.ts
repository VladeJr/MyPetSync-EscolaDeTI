import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

const AppointmentStatus = ['scheduled', 'completed', 'canceled', 'confirmed'];

export class QueryAppointmentDto {
  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional()
  @IsMongoId()
  pet?: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsOptional()
  @IsMongoId()
  provider?: string;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(AppointmentStatus, { each: true })
  status?: string | string[];

  @ApiPropertyOptional({
    description: 'Busca livre (reason/location)',
    example: 'rotina',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Início do período',
    example: '2025-10-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Fim do período',
    example: '2025-10-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: '0' })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ example: '300' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por data asc? true/false',
    example: 'false',
  })
  @IsOptional()
  @IsBooleanString()
  asc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;
}
