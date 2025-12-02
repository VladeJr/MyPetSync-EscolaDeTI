import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsNotEmpty()
  participants: string[]; 
}
