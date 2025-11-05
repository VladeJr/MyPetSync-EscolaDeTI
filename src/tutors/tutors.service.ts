import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tutor, TutorDocument } from './schemas/tutor.schema';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';

@Injectable()
export class TutorsService {
  constructor(
    @InjectModel(Tutor.name) private readonly model: Model<TutorDocument>,
  ) {}

  async countAll(): Promise<number> {
    return this.model.countDocuments({});
  }

  async createForUser(userId: string, name: string, dto: CreateTutorDto) {
    return this.model.create({
      ...dto,
      name,
      userId: new Types.ObjectId(userId),
    });
  }

  async getByUserId(userId: string) {
    return this.model.findOne({ userId }).lean();
  }

  async getById(id: string) {
    const tutor = await this.model.findById(id).lean();
    if (!tutor) throw new NotFoundException('Tutor não encontrado');
    return tutor;
  }

  async updateMine(userId: string, dto: UpdateTutorDto) {
    const updated = await this.model
      .findOneAndUpdate({ userId }, dto, { new: true, upsert: false })
      .lean();
    if (!updated) throw new NotFoundException('Tutor não encontrado');
    return updated;
  }

  async removeMine(userId: string) {
    const res = await this.model.deleteOne({ userId });
    if (res.deletedCount === 0)
      throw new NotFoundException('Tutor não encontrado');
    return { ok: true };
  }

  async listAll(limit = 50, page = 1) {
    return this.model
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }
}