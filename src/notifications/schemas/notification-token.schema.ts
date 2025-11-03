import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationTokenDocument = NotificationToken & Document;

@Schema({ timestamps: true, collection: 'notification_tokens' })
export class NotificationToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, trim: true })
  token: string;

  @Prop({ trim: true }) platform?: 'android' | 'ios' | 'web';
}

export const NotificationTokenSchema = SchemaFactory.createForClass(NotificationToken);
NotificationTokenSchema.index({ user: 1, token: 1 }, { unique: true });
