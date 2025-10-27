import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProviderDocument = Provider & Document;

export enum ProviderType {
  AUTONOMO = 'autonomo',
  COMPANY = 'empresa',
}

@Schema({ timestamps: true, collection: 'providers' })
export class Provider {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 160,
  })
  email: string;

  @Prop({
    type: String,
    enum: ProviderType,
    default: ProviderType.AUTONOMO,
    required: true,
  })
  type: ProviderType;

  // 💡 NOVO: CPF (sparse: true permite que o campo seja único apenas onde existe valor)
  @Prop({ type: String, unique: true, sparse: true, maxlength: 14 })
  cpf?: string;

  // 💡 NOVO: CNPJ
  @Prop({ type: String, unique: true, sparse: true, maxlength: 18 })
  cnpj?: string;

  @Prop({ trim: true, maxlength: 20 })
  whatsapp?: string;

  @Prop({ trim: true, maxlength: 80 })
  city?: string;

  @Prop({ trim: true, uppercase: true, minlength: 2, maxlength: 2 })
  state?: string; // UF

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: String })
  bio?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  averageRating: number;

  @Prop({ type: [String], default: [] })
  servicesOffered: string[];
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);

ProviderSchema.index({ email: 1 }, { unique: true });
ProviderSchema.index({ city: 'text', state: 1 });
ProviderSchema.index({ servicesOffered: 1 });
