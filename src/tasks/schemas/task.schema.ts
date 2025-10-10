import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  PENDING = 'pendente',
  COMPLETED = 'concluida',
  CANCELLED = 'cancelada',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true, index: true }) // referencia ao Pet p qual a tarefa foi criada
  petId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tutor', required: true, index: true })
  tutorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ default: 30 })
  durationMinutes: number; // duração default da tarefa

  @Prop({ default: TaskStatus.PENDING, enum: TaskStatus })
  status: TaskStatus;

  @Prop({ default: true })
  reminder: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ tutorId: 1, dateTime: 1 }); // index para consultas por tutor e data.
