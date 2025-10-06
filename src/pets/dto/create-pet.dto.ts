import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
} from 'class-validator';
import { PetSpecies, PetGender } from '../schemas/pets.schema';

export class CreatePetDto {
  @IsString()
  nome: string;

  @IsEnum(PetSpecies)
  especie: PetSpecies;

  @IsString()
  @IsOptional()
  raca?: string;

  @IsEnum(PetGender)
  @IsOptional()
  genero?: PetGender;

  @IsNumber()
  @IsOptional()
  idade?: number;

  @IsNumber()
  @IsOptional()
  peso?: number;

  @IsString()
  @IsOptional()
  foto?: string;

  @IsBoolean()
  @IsOptional()
  castrado?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  condicoes_especiais?: string[];
}
