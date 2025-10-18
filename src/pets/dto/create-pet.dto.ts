import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
} from 'class-validator';
import { PetSpecies, PetGender } from '../schemas/pets.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePetDto {
  @ApiProperty({ example: 'Thor' })
  @IsString()
  nome: string;

  @ApiProperty({ example: PetSpecies.DOG, enum: PetSpecies })
  @IsEnum(PetSpecies)
  especie: PetSpecies;

  @IsString()
  @IsOptional()
  raca?: string;

  @ApiProperty({ example: PetGender.MALE, enum: PetGender })
  @IsEnum(PetGender)
  @IsOptional()
  genero?: PetGender;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsOptional()
  idade?: number;

  @IsNumber()
  @IsOptional()
  peso?: number;

  @IsString()
  @IsOptional()
  foto?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  castrado?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  condicoes_especiais?: string[];
}
