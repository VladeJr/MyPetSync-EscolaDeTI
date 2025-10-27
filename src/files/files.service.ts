import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileAsset, FileAssetDocument } from './schemas/file.schema';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class FilesService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor(@InjectModel(FileAsset.name) private readonly model: Model<FileAssetDocument>) {}

  ensureDir() {
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async saveMeta(
    file: { originalname: string; filename: string; mimetype: string; size: number },
    kind?: string,
    ownerId?: string,
  ) {
    const doc = (await this.model.create({
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/files/${/* id será substituído após create */''}`, // placeholder
      kind,
      ownerId: ownerId ? new Types.ObjectId(ownerId) : undefined,
    })) as FileAssetDocument;
    const objectId = doc._id as unknown as Types.ObjectId;
    doc.url = `/files/${objectId.toString()}/stream`;
    await doc.save();
    return doc.toObject();
  }

  async getStreamInfo(id: string) {
    const file = await this.model.findById(id).lean();
    if (!file) throw new NotFoundException('Arquivo não encontrado.');
    const filePath = path.join(this.uploadDir, file.filename);
    if (!fs.existsSync(filePath)) throw new NotFoundException('Arquivo físico não encontrado.');
    return { file, filePath };
  }

  async remove(id: string) {
    const file = await this.model.findByIdAndDelete(id).lean();
    if (!file) throw new NotFoundException('Arquivo não encontrado.');
    const filePath = path.join(this.uploadDir, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return { success: true };
  }
}
