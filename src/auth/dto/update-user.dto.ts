import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Novo Nome Completo' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'novo.email@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;
}
