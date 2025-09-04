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
  breed: { type: String },
  age: { type: Number },
  weight: { type: Number },
  neutered: { type: Boolean },
  conditions: { type: [String], default: [] },
  photoUrl: { type: String },
});
