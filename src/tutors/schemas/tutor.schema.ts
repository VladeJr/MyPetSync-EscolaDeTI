import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TutorDocument = HydratedDocument<Tutor>;

@Schema({ _id: false })
class Address {
  @Prop({ required: true }) label: string;
  @Prop({ required: true }) street: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) state: string;
  @Prop({ required: true }) zip: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class Tutor {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) name: string;
  @Prop() phone?: string;
  @Prop() avatarUrl?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];
}

export const TutorSchema = SchemaFactory.createForClass(Tutor);
