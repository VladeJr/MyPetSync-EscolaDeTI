import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[]; // usuários envolvidos no chat

  @Prop({ default: true })
  isActive: boolean;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
