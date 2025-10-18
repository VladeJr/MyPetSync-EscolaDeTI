import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, { message: 'Forneça um email válido' })
  @IsNotEmpty({ message: 'O email é inválido' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsNotEmpty({ message: 'A senha deve ter no mínimo 6 caracteres' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
