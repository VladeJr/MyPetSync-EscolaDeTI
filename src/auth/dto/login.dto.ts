import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Forneça um email válido' })
  @IsNotEmpty({ message: 'O email é inválido' })
  email: string;

  @IsNotEmpty({ message: 'A senha deve ter no mínimo 6 caracteres' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
