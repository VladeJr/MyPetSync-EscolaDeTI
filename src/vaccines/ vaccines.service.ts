import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Vaccine, VaccineDocument } from './schemas/vaccine.schema';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { QueryVaccineDto } from './dto/query-vaccine.dto';
import { Pet, PetDocument } from '../pets/schemas/pets.schema';

@Injectable()
export class VaccinesService {
  constructor(
    @InjectModel(Vaccine.name) private readonly model: Model<VaccineDocument>,
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
  ) {}

  private async assertPet(petId: string | Types.ObjectId) {
    const exists = await this.petModel.exists({ _id: petId as any });
    if (!exists) throw new NotFoundException('Pet não encontrado.');
  }

  async create(dto: CreateVaccineDto) {
    await this.assertPet(dto.pet);
    const created = await this.model.create({
      ...dto,
      pet: new Types.ObjectId(dto.pet),
    });
    return created.toObject();
  }

  async createForPet(petId: string, payload: Omit<CreateVaccineDto, 'pet'>) {
    return this.create({ ...payload, pet: petId });
  }

  async findAll(q: QueryVaccineDto) {
    const filter: FilterQuery<VaccineDocument> = {};

    if (q.pet) filter.pet = new Types.ObjectId(q.pet);

    if (q.q) {
      filter.$text = { $search: q.q };
    }

    if (typeof q.completed !== 'undefined') {
      filter.isCompleted = q.completed === 'true';
    }

    if (q.overdue === 'true') {
      filter.nextDoseAt = { $lt: new Date() };
      filter.isCompleted = false;
    }

   
    if (q.dueUntil) {
      filter.nextDoseAt = { ...(filter.nextDoseAt || {}), $lte: new Date(q.dueUntil) };
      filter.isCompleted = false;
    }

 
    if (q.appliedFrom || q.appliedTo) {
      filter.appliedAt = {};
      if (q.appliedFrom) (filter.appliedAt as any).$gte = new Date(q.appliedFrom);
      if (q.appliedTo) (filter.appliedAt as any).$lte = new Date(q.appliedTo);
    }

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('pet', 'name species breed owner')
        .sort({ nextDoseAt: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const found = await this.model
      .findById(id)
      .populate('pet', 'name species breed owner')
      .lean();
    if (!found) throw new NotFoundException('Vacina não encontrada.');
    return found;
  }

  async update(id: string, dto: UpdateVaccineDto) {
    if (dto.pet) await this.assertPet(dto.pet);

    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true, lean: true },
    );
    if (!updated) throw new NotFoundException('Vacina não encontrada.');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Vacina não encontrada.');
    return { success: true };
  }

  async removeByPet(petId: string | Types.ObjectId) {
    await this.model.deleteMany({ pet: petId as any });
  }
}
