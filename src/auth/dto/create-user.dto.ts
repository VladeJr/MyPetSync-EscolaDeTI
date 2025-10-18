import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserType } from 'src/users/schemas/user.schema';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar em branco.' })
  nome: string;

  @IsEmail({}, { message: 'Forneça um email válido.' })
  @IsString({ message: 'O email deve ser uma string.' })
  @IsNotEmpty({ message: 'O email não pode estar branco.' })
  email: string;

  @IsString({ message: 'A senha deve ser em caracteres' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres. ' })
  @IsNotEmpty({ message: 'A senha não pode estar em branco.' })
  senha: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsOptional()
  foto_perfil?: string;

  @IsEnum(UserType, {
    message: 'O tipo de usuário deve ser tutor ou provedor.',
  })
  tipo_usuario: string;
}
