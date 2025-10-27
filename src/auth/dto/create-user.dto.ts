import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ProviderType } from 'src/providers/schemas/provider.schema';
import { UserType } from 'src/users/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar em branco.' })
  nome: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, { message: 'Forneça um email válido.' })
  @IsString({ message: 'O email deve ser uma string.' })
  @IsNotEmpty({ message: 'O email não pode estar branco.' })
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Minimo de 6 caracteres' })
  @IsString({ message: 'A senha deve ser em caracteres' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres. ' })
  @IsNotEmpty({ message: 'A senha não pode estar em branco.' })
  senha: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsOptional()
  foto_perfil?: string;

  @ApiProperty({ example: UserType.TUTOR, enum: UserType })
  @IsEnum(UserType, {
    message: 'O tipo de usuário deve ser tutor ou provedor.',
  })
  tipo_usuario: UserType;

  // tipo de prestador
  @ApiPropertyOptional({
    example: ProviderType.AUTONOMO,
    enum: ProviderType,
    description: 'Tipo de prestador (obrigatório se tipo_usuario for provider)',
  })
  @IsEnum(ProviderType)
  @ValidateIf((dto: CreateUserDto) => dto.tipo_usuario === UserType.PROVIDER)
  @IsNotEmpty({ message: 'O tipo de prestador é obrigatório.' })
  type?: ProviderType;

  // cpf obrigatório se for AUTONOMO
  @ApiPropertyOptional({
    example: '123.456.789-00',
    description: 'CPF, obrigatório se o tipo for autonomo.',
  })
  @IsString()
  @ValidateIf(
    (dto: CreateUserDto) =>
      dto.tipo_usuario === UserType.PROVIDER &&
      dto.type === ProviderType.AUTONOMO,
  )
  @IsNotEmpty({ message: 'CPF é obrigatório para prestadores autônomos.' })
  cpf?: string;

  // cnpj obrigatório se for EMPRESA
  @ApiPropertyOptional({
    example: '12.345.678/0001-90',
    description: 'CNPJ, obrigatório se o tipo for empresa.',
  })
  @IsString()
  @ValidateIf(
    (dto: CreateUserDto) =>
      dto.tipo_usuario === UserType.PROVIDER &&
      dto.type === ProviderType.COMPANY,
  )
  @IsNotEmpty({ message: 'CNPJ é obrigatório para prestadores PJ.' })
  cnpj?: string;
}
