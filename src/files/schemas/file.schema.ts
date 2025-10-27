import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileAssetDocument = FileAsset & Document;

@Schema({ timestamps: true, collection: 'files' })
export class FileAsset {
  @Prop({ required: true, trim: true }) originalName: string;
  @Prop({ required: true, trim: true }) filename: string;      // nome salvo no disco
  @Prop({ required: true, trim: true }) mimeType: string;
  @Prop({ required: true }) size: number;
  @Prop({ required: true, trim: true }) url: string;           // ex.: /files/<id>/stream
  @Prop({ type: String, trim: true }) kind?: 'exam' | 'prescription'; // finalidade
  @Prop({ type: Types.ObjectId }) ownerId?: Types.ObjectId;    // examId / prescriptionId
}

export const FileAssetSchema = SchemaFactory.createForClass(FileAsset);
FileAssetSchema.index({ kind: 1, ownerId: 1 });
