import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsMongoId,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryServiceDto {
  @ApiPropertyOptional({
    description: 'Filtrar por prestador',
    example: '66f1d9d1c6a7bcf0b1a9c123',
  })
  @IsOptional()
  @IsMongoId()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Busca por nome/descrição',
    example: 'banho',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'grooming' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Apenas ativos? true/false',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  active?: string;

  @ApiPropertyOptional({ description: 'Preço mín (R$)', example: '20' })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ description: 'Preço máx (R$)', example: '100' })
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
}
