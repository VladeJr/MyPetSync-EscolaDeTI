import { Schema, Document } from 'mongoose';

export interface Pet extends Document {
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  neutered: boolean;
  conditions: string[];
  photoUrl?: string;
}

export const PetSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  neutered: { type: Boolean, required: true },
  conditions: { type: [String], default: [] },
  photoUrl: { type: String },
});
