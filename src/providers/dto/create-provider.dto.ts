import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsBoolean, IsEmail, IsLatitude, IsLongitude,
  IsOptional, IsString, Length, MaxLength,
} from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ example: 'Clínica Vet Maringá' })
  @IsString() @Length(2, 120)
  name: string;

  @ApiProperty({ example: 'contato@vetmga.com' })
  @IsEmail() @MaxLength(160)
  email: string;

  @ApiPropertyOptional({ example: '+55 44 99999-0000' })
  @IsOptional() @IsString() @MaxLength(20)
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'Maringá' })
  @IsOptional() @IsString() @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ example: 'PR' })
  @IsOptional() @IsString() @Length(2, 2)
  state?: string;

  @ApiPropertyOptional({ example: -23.42 })
  @IsOptional() @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: -51.933056 })
  @IsOptional() @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Atendimento 24h, cirurgias e exames.' })
  @IsOptional() @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['banho', 'tosa', 'consulta'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  servicesOffered?: string[];
}
