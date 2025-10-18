import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryProviderDto {
  @ApiPropertyOptional({ example: 'Maringá' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'PR' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Filtra por serviço oferecido',
    example: 'banho',
  })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({
    description: 'Apenas ativos? true/false',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  active?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Busca por nome (case-insensitive)',
    example: 'petshop',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
