import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ example: 'Vacina V10' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Levar carteira de vacinação.' })
  @IsOptional() @IsString() @MaxLength(300)
  message?: string;

  @ApiPropertyOptional({ example: '2025-11-05T12:00:00.000Z', description: 'UTC' })
  @IsOptional() @IsDateString()
  targetAt?: string;

  @ApiPropertyOptional({ enum: ['none','daily','weekly','monthly'], default: 'none' })
  @IsOptional() @IsEnum(['none','daily','weekly','monthly'])
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ example: 1440, description: 'Minutos de antecedência (ex.: 1440 = 1 dia)' })
  @IsOptional() @IsInt() @Min(0)
  leadMinutes?: number;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional() @IsMongoId()
  pet?: string;

  @ApiPropertyOptional({ example: { type: 'vaccine', vaccineId: 'abc123' } })
  @IsOptional()
  meta?: Record<string, any>;
}
