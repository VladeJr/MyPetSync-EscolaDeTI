import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsOptional() @IsMongoId()
  provider?: string;

  @ApiPropertyOptional({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsOptional() @IsMongoId()
  service?: string;

  @ApiProperty({ example: 5 })
  @IsNumber() @IsInt() @Min(1) @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Excelente atendimento!' })
  @IsOptional() @IsString() @MaxLength(500)
  comment?: string;
}
