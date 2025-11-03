import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumberString, IsOptional } from 'class-validator';

export class QueryReminderDto {
  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional() @IsMongoId()
  pet?: string;

  @ApiPropertyOptional({ enum: ['active','paused','done'] })
  @IsOptional() @IsEnum(['active','paused','done'])
  status?: 'active' | 'paused' | 'done';

  @ApiPropertyOptional({ example: '1' })
  @IsOptional() @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional() @IsNumberString()
  limit?: string;
}
