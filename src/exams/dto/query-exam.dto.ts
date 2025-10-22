import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryExamDto {
  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional() @IsMongoId()
  pet?: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsOptional() @IsMongoId()
  appointment?: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9c999' })
  @IsOptional() @IsMongoId()
  provider?: string;

  @ApiPropertyOptional({ enum: ['requested','collected','ready','canceled'] })
  @IsOptional() @IsEnum(['requested','collected','ready','canceled'])
  status?: 'requested' | 'collected' | 'ready' | 'canceled';

  @ApiPropertyOptional({ description: 'Busca livre (nome, laudo, laboratório)', example: 'hemograma' })
  @IsOptional() @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Início do período de resultado', example: '2025-10-01T00:00:00.000Z' })
  @IsOptional() @IsDateString()
  resultFrom?: string;

  @ApiPropertyOptional({ description: 'Fim do período de resultado', example: '2025-10-31T23:59:59.000Z' })
  @IsOptional() @IsDateString()
  resultTo?: string;

  @ApiPropertyOptional({ example: '0' })
  @IsOptional() @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ example: '300' })
  @IsOptional() @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional() @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional() @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ description: 'Ordenar por data de resultado ascendente?', example: 'false' })
  @IsOptional() @IsString()
  asc?: string;
}
