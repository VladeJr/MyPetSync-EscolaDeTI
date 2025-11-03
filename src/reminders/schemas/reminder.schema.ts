import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

@Schema({ timestamps: true, collection: 'reminders' })
export class Reminder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pet', required: false, index: true })
  pet?: Types.ObjectId;

  @Prop({ type: String, trim: true, required: true })
  title: string; // "Vacina V10", "Consulta", "Medicamento"

  @Prop({ type: String, trim: true })
  message?: string;

  // Disparo base (UTC). Opcional se tiver recorrência.
  @Prop({ type: Date })
  targetAt?: Date; // ex.: 2025-11-05T12:00:00.000Z

  // Recorrência simples
  @Prop({ type: String, enum: ['none','daily','weekly','monthly'], default: 'none', index: true })
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';

  // Antecedência em minutos (ex.: 1440 = 1 dia antes)
  @Prop({ type: Number, min: 0, default: 0 })
  leadMinutes: number;

  // Próxima execução (UTC) calculada; o scheduler usa isso
  @Prop({ type: Date, index: true })
  nextRunAt?: Date;

  // Ativo/pausado
  @Prop({ type: String, enum: ['active','paused','done'], default: 'active', index: true })
  status: 'active' | 'paused' | 'done';

  // Metadados extras (ids de consulta, vacina, etc.)
  @Prop({ type: Object })
  meta?: Record<string, any>;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
ReminderSchema.index({ user: 1, nextRunAt: 1, status: 1 });
