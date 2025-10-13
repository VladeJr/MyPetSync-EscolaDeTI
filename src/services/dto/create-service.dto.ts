import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'ID do prestador (ObjectId)', example: '66f1d9d1c6a7bcf0b1a9c123' })
  @IsMongoId()
  provider: string;

  @ApiProperty({ example: 'Banho' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Banho completo com secagem.' })
  @IsOptional() @IsString() @MaxLength(200)
  description?: string;

  @ApiProperty({ example: 59.9, description: 'Preço em Reais' })
  @IsNumber() @Min(0)
  price: number;

  @ApiProperty({ example: 45, description: 'Duração (min)' })
  @IsInt() @IsPositive()
  duration: number;

  @ApiPropertyOptional({ example: 'grooming' })
  @IsOptional() @IsString() @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
