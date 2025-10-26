import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, SortOrder } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { Pet, PetDocument } from '../pets/schemas/pets.schema';
import { Appointment, AppointmentDocument } from '../appointments/schemas/appointment.schema';
import { Provider, ProviderDocument } from '../providers/schemas/provider.schema';

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name) private readonly model: Model<ExamDocument>,
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
    @InjectModel(Appointment.name) private readonly apptModel: Model<AppointmentDocument>,
    @InjectModel(Provider.name) private readonly providerModel: Model<ProviderDocument>,
  ) {}

  private async assertPet(id: string | Types.ObjectId) {
    const ok = await this.petModel.exists({ _id: id as any });
    if (!ok) throw new NotFoundException('Pet não encontrado.');
  }
  private async assertAppointment(id?: string | Types.ObjectId) {
    if (!id) return;
    const ok = await this.apptModel.exists({ _id: id as any });
    if (!ok) throw new NotFoundException('Consulta não encontrada.');
  }
  private async assertProvider(id?: string | Types.ObjectId) {
    if (!id) return;
    const ok = await this.providerModel.exists({ _id: id as any });
    if (!ok) throw new NotFoundException('Prestador não encontrado.');
  }

  async create(dto: CreateExamDto) {
    await this.assertPet(dto.pet);
    await this.assertAppointment(dto.appointment);
    await this.assertProvider(dto.provider);

    const created = await this.model.create({
      ...dto,
      pet: new Types.ObjectId(dto.pet),
      appointment: dto.appointment ? new Types.ObjectId(dto.appointment) : undefined,
      provider: dto.provider ? new Types.ObjectId(dto.provider) : undefined,
      requestedAt: dto.requestedAt ? new Date(dto.requestedAt) : undefined,
      collectedAt: dto.collectedAt ? new Date(dto.collectedAt) : undefined,
      resultAt: dto.resultAt ? new Date(dto.resultAt) : undefined,
    });
    return created.toObject();
  }

  async createForPet(petId: string, payload: Omit<CreateExamDto, 'pet'>) {
    return this.create({ ...payload, pet: petId });
  }

  async findAll(q: QueryExamDto) {
    const filter: FilterQuery<ExamDocument> = {};

    if (q.pet) filter.pet = new Types.ObjectId(q.pet);
    if (q.appointment) filter.appointment = new Types.ObjectId(q.appointment);
    if (q.provider) filter.provider = new Types.ObjectId(q.provider);
    if (q.status) filter.status = q.status;

    if (q.q) {
      filter.$or = [
        { name: { $regex: q.q, $options: 'i' } },
        { labName: { $regex: q.q, $options: 'i' } },
        { resultText: { $regex: q.q, $options: 'i' } },
      ];
    }

    if (q.resultFrom || q.resultTo) {
      filter.resultAt = {};
      if (q.resultFrom) (filter.resultAt as any).$gte = new Date(q.resultFrom);
      if (q.resultTo) (filter.resultAt as any).$lte = new Date(q.resultTo);
    }

    if (q.minPrice || q.maxPrice) {
      filter.price = {};
      if (q.minPrice) (filter.price as any).$gte = Number(q.minPrice);
      if (q.maxPrice) (filter.price as any).$lte = Number(q.maxPrice);
    }

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = q.asc === 'true'
      ? { resultAt: 1 as SortOrder }
      : { resultAt: -1 as SortOrder, createdAt: -1 as SortOrder };

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('pet', 'name species')
        .populate('appointment', 'dateTime status')
        .populate('provider', 'name city state')
        .sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const found = await this.model
      .findById(id)
      .populate('pet', 'name species')
      .populate('appointment', 'dateTime status')
      .populate('provider', 'name city state')
      .lean();
    if (!found) throw new NotFoundException('Exame não encontrado.');
    return found;
  }

  async update(id: string, dto: UpdateExamDto) {
    if (dto.pet) await this.assertPet(dto.pet);
    if (dto.appointment) await this.assertAppointment(dto.appointment);
    if (dto.provider) await this.assertProvider(dto.provider);

    const payload: any = { ...dto };
    if (dto.requestedAt) payload.requestedAt = new Date(dto.requestedAt);
    if (dto.collectedAt) payload.collectedAt = new Date(dto.collectedAt);
    if (dto.resultAt) payload.resultAt = new Date(dto.resultAt);

    const updated = await this.model.findByIdAndUpdate(
      id, { $set: payload }, { new: true, runValidators: true, lean: true },
    );
    if (!updated) throw new NotFoundException('Exame não encontrado.');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Exame não encontrado.');
    return { success: true };
  }

  /** Cascata */
  async removeByPet(petId: string | Types.ObjectId) {
    await this.model.deleteMany({ pet: petId as any });
  }
  async removeByAppointment(apptId: string | Types.ObjectId) {
    await this.model.deleteMany({ appointment: apptId as any });
  }
}
