import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserType {
  TUTOR = 'tutor',
  PROVIDER = 'provider',
}

@Schema({ timestamps: { createdAt: 'data_criacao' } })
export class User extends Document {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  senha_hash: string;

  @Prop()
  telefone: string;

  @Prop()
  foto_perfil: string;

  @Prop({ enum: UserType }) // adicionar required: true
  tipo_usuario: UserType;
}

export const UserSchema = SchemaFactory.createForClass(User);
