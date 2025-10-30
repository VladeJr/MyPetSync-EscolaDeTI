import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ example: 'Consulta agendada com sucesso!' })
  @IsNotEmpty() @IsString() title: string;

  @ApiProperty({ example: 'Sua consulta foi marcada para amanhã às 10h.' })
  @IsNotEmpty() @IsString() body: string;

  @ApiProperty({ example: ['fcmToken1', 'fcmToken2'] })
  @IsOptional() @IsArray()
  tokens?: string[];

  @ApiProperty({ example: { petId: 'abc123', type: 'consulta' } })
  @IsOptional()
  data?: Record<string, string>;
}
