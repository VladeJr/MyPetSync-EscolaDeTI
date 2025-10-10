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

export class CreateTaskDto {
  @IsMongoId({ message: 'Deve ser um MongoId válido' })
  @IsNotEmpty({ message: 'Deve conter ID do Pet' })
  petId: string;

  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsNotEmpty({ message: 'A data e hora da tarefa é obrigatória' })
  dateTime: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  reminder?: boolean;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
