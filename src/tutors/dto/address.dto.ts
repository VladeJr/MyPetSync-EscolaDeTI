import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    example: 'Casa Principal',
    description: 'Rótulo para identificar o endereço.',
  })
  @IsString()
  label: string;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Maringá' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'PR' })
  @IsString()
  state: string;

  @ApiProperty({ example: '87000-000' })
  @IsString()
  zip: string;
}
