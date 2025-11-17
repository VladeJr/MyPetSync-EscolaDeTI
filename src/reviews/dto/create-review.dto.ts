import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '66f1d9d1c6a7bcf0b1a9caaa' })
  @IsMongoId() @IsNotEmpty()
  provider: string; 

  @ApiProperty({ example: '66f1d9d1c6a7bcf0b1a9cbbb' })
  @IsMongoId() @IsNotEmpty()
  appointment: string;

  @ApiProperty({ example: 5 })
  @IsNumber() @IsInt() @Min(1) @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Excelente atendimento!' })
  @IsOptional() @IsString() @MaxLength(500)
  comment?: string;
}
