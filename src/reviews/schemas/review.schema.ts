import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Provider', required: false, index: true })
  provider?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: false, index: true })
  service?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true, maxlength: 500 })
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ provider: 1, author: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ service: 1, author: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ rating: 1 });
