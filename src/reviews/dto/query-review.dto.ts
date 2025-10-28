import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumberString, IsOptional } from 'class-validator';

export class QueryReviewDto {
  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional() @IsMongoId()
  provider?: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsOptional() @IsMongoId()
  service?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional() @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional() @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ enum: ['asc','desc'], example: 'desc' })
  @IsOptional() @IsEnum(['asc','desc'])
  order?: 'asc' | 'desc';
}
