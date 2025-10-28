import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de redefinição de senha (longo), extraído da URL.',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'A nova senha do usuário (mínimo 6 caracteres).',
    example: 'NovaSenhaSegura123',
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty()
  newPassword: string;
}
