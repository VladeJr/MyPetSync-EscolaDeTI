import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true, collection: 'exams' })
export class Exam {
  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true, index: true })
  pet: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment', required: false, index: true })
  appointment?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Provider', required: false, index: true })
  provider?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;                       // “Hemograma”, “Ultrassom Abdominal”...

  @Prop({ trim: true, maxlength: 80 })
  category?: string;                  // “sangue”, “imagem”, “urina”...

  @Prop({ type: String, enum: ['requested', 'collected', 'ready', 'canceled'], default: 'requested', index: true })
  status: 'requested' | 'collected' | 'ready' | 'canceled';

  @Prop({ type: Date })
  requestedAt?: Date;

  @Prop({ type: Date })
  collectedAt?: Date;

  @Prop({ type: Date })
  resultAt?: Date;

  @Prop({ type: Number, min: 0 })
  price?: number;

  @Prop({ trim: true, maxlength: 120 })
  labName?: string;

  @Prop({ type: String })
  resultUrl?: string;                 // link de arquivo (se usar S3/Drive)

  @Prop({ type: String })
  resultText?: string;                // laudo em texto

  @Prop({ type: String })
  notes?: string;                     // observações
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.index({ pet: 1, name: 1, requestedAt: -1 });
ExamSchema.index({ category: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ name: 'text', resultText: 'text', labName: 'text' });
