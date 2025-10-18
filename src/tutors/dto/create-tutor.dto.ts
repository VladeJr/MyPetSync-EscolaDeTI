import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTutorDto {
  @ApiPropertyOptional({
    example: '+55 44 98765-4321',
    description: 'Telefone de contato do tutor.',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.mypetsync.com/avatar/joao.jpg',
    description: 'URL da foto de perfil.',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    type: [AddressDto],
    description: 'Lista de endereços do tutor.',
    example: [
      {
        label: 'Casa Principal',
        street: 'Rua das Flores, 123',
        city: 'Maringá',
        state: 'PR',
        zip: '87000-000',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];
}
