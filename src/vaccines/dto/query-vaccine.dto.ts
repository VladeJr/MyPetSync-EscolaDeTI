import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryVaccineDto {
  @ApiPropertyOptional({
    description: 'Filtrar por pet',
    example: '66f1d9d1c6a7bcf0b1a9c123',
  })
  @IsOptional()
  @IsMongoId()
  pet?: string;

  @ApiPropertyOptional({
    description: 'Busca por nome/fabricante',
    example: 'raiva',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Apenas concluídas? true/false',
    example: 'false',
  })
  @IsOptional()
  @IsBooleanString()
  completed?: string;

  @ApiPropertyOptional({
    description: 'Somente vencidas? (nextDoseAt < hoje)',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  overdue?: string;

  @ApiPropertyOptional({
    description: 'Somente próximas (até data)',
    example: '2025-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueUntil?: string;

  @ApiPropertyOptional({
    description: 'Aplicadas entre (início)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  appliedFrom?: string;

  @ApiPropertyOptional({
    description: 'Aplicadas entre (fim)',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  appliedTo?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
