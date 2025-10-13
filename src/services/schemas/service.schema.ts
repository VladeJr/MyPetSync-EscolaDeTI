import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true, collection: 'services' })
export class Service {
  @Prop({ type: Types.ObjectId, ref: 'Provider', required: true, index: true })
  provider: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string; 

  @Prop({ trim: true, maxlength: 200 })
  description?: string;

  @Prop({ type: Number, min: 0, default: 0 })
  price: number; 

  @Prop({ type: Number, min: 1, default: 30 })
  duration: number;

  @Prop({ type: String, trim: true, maxlength: 60 })
  category?: string; 

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ provider: 1, name: 1 }, { unique: true });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });
