import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true, collection: 'appointments' })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true, index: true })
  pet: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Provider', required: true, index: true })
  provider: Types.ObjectId;

  @Prop({ required: true })
  dateTime: Date;              // data/hora da consulta

  @Prop({ type: Number, min: 0, default: 30 })
  duration: number;            // minutos

  @Prop({ type: String, trim: true, maxlength: 120 })
  reason?: string;             // motivo (queixa)

  @Prop({ type: String, trim: true, maxlength: 200 })
  location?: string;           // endereço/clinica (se aplicável)

  @Prop({ type: Number, min: 0, default: 0 })
  price: number;               // valor em R$

  @Prop({ type: String, enum: ['scheduled', 'completed', 'canceled'], default: 'scheduled', index: true })
  status: 'scheduled' | 'completed' | 'canceled';

  @Prop({ type: String })
  notes?: string;              // observações/condutas
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// índices úteis
AppointmentSchema.index({ dateTime: 1 });
AppointmentSchema.index({ pet: 1, provider: 1, dateTime: 1 });
