import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateTutorDto {
  @IsString() name: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatarUrl?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AddressDto)
  addresses?: AddressDto[];
}
