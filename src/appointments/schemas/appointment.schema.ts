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
  dateTime: Date;

  @Prop({ type: Number, min: 0, default: 30 })
  duration: number;

  @Prop({ type: String, trim: true, maxlength: 120 })
  reason?: string;

  @Prop({ type: String, trim: true, maxlength: 200 })
  location?: string;

  @Prop({ type: Number, min: 0, default: 0 })
  price: number;

  @Prop({
    type: String,
    enum: ['scheduled', 'completed', 'canceled', 'confirmed'],
    default: 'scheduled',
    index: true,
  })
  status: 'scheduled' | 'completed' | 'canceled' | 'confirmed';

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  phone?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ dateTime: 1 });
AppointmentSchema.index({ pet: 1, provider: 1, dateTime: 1 });
