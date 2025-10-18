import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @IsMongoId({ message: 'Deve ser um MongoId válido' })
  @IsNotEmpty({ message: 'Deve conter ID do Pet' })
  petId: string;

  @ApiProperty({
    example: 'Passear no parque',
    description: 'Breve título para tarefa',
  })
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório' })
  title: string;

  @ApiPropertyOptional({ example: 'Levar coleira' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2025-10-25T10:30:00.000Z',
    description: 'Data e hora da tarefa (formato ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'A data e hora da tarefa é obrigatória' })
  dateTime: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duração da tarefa em minutos',
  })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicador para configurar lembrete',
  })
  @IsOptional()
  @IsBoolean()
  reminder?: boolean;

  @ApiPropertyOptional({
    example: TaskStatus.PENDING,
    enum: TaskStatus,
    description: 'Status da tarefa',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
