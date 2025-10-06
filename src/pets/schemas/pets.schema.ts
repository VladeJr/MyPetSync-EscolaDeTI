import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type PetDocument = Pet & Document;

export enum PetSpecies {
  DOG = 'Cão',
  CAT = 'Gato',
}

export enum PetGender {
  MALE = 'Macho',
  FEMALE = 'Fêmea',
}
// adicionar o enum de raças, contendo todas as raças de cão e gato
@Schema()
export class Pet extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  tutorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ type: String, enum: PetSpecies, required: true })
  especie: string;

  @Prop({ trim: true })
  raca?: string;

  @Prop({ type: String, enum: PetGender })
  genero?: string;

  @Prop()
  idade?: number;

  @Prop()
  peso?: number;

  @Prop()
  foto?: string;

  @Prop({ default: false })
  castrado?: boolean;

  @Prop([String])
  condicoes_especiais?: string[];
}

export const PetSchema = SchemaFactory.createForClass(Pet);
