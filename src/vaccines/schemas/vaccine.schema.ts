import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VaccineDocument = Vaccine & Document;

@Schema({ timestamps: true, collection: 'vacines' })
export class Vaccine {
    @Prop({ type: Types.ObjectId, ref: 'Pet', required: true, index: true })
    pet: Types.ObjectId;

    @Prop({ requires: true, trim: true, maxlength: 120})
    name: string;

    @Prop({ trim: true, maxlength: 120})
    manufacturer?: string;

    @Prop({ trim: true, maxlength: 60})
    batch?: string;

    @Prop({ type: Number, min: 0 })
    doseMl?: number;

    @Prop({ type: String, enum: ['SC', 'IM', 'Oral', 'Nasal'], default: 'SC' })
    route: 'SC' | 'IM' | 'Oral' | 'Nasal';

    @Prop({ type: Date })
    appliedAt?: Date;

    @Prop({ type: Date })
    nextDoseAt?: Date;

    @Prop({ type: Boolean, default: false, index: true })
    isCompleted: boolean;

    @Prop({ type: String, trim: true, maxlength: 180 })
    veterinarian?: string;

    @Prop({ type: String })
    notes?: string;
}

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);

VaccineSchema.index({ pet: 1, name: 1, appliedAt: -1 });
VaccineSchema.index({ nextDoseAt: 1 });
VaccineSchema.index({ isCompleted: 1 });
VaccineSchema.index({ name: 'text', manufacturer: 'text' });