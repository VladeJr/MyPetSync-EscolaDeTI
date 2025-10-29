import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, SortOrder } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { Pet, PetDocument } from '../pets/schemas/pets.schema';
import {
  Provider,
  ProviderDocument,
} from '../providers/schemas/provider.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly model: Model<AppointmentDocument>,
    @InjectModel(Pet.name) private readonly petModel: Model<PetDocument>,
    @InjectModel(Provider.name)
    private readonly providerModel: Model<ProviderDocument>,
  ) {}

  private async assertPet(id: string | Types.ObjectId) {
    const ok = await this.petModel.exists({ _id: id as any });
    if (!ok) throw new NotFoundException('Pet não encontrado.');
  }
  private async assertProvider(id: string | Types.ObjectId) {
    const ok = await this.providerModel.exists({ _id: id as any });
    if (!ok) throw new NotFoundException('Prestador não encontrado.');
  }

  async create(dto: CreateAppointmentDto) {
    await this.assertPet(dto.pet);
    await this.assertProvider(dto.provider);
    const created = await this.model.create({
      ...dto,
      pet: new Types.ObjectId(dto.pet),
      provider: new Types.ObjectId(dto.provider),
      dateTime: new Date(dto.dateTime),
    });
    return created.toObject();
  }

  async createForPet(
    petId: string,
    payload: Omit<CreateAppointmentDto, 'pet'>,
  ) {
    return this.create({ ...payload, pet: petId });
  }
  async createForProvider(
    providerId: string,
    payload: Omit<CreateAppointmentDto, 'provider'>,
  ) {
    return this.create({ ...payload, provider: providerId });
  }
  async findAll(q: QueryAppointmentDto) {
    const filter: FilterQuery<AppointmentDocument> = {};
    if (q.provider) filter.provider = new Types.ObjectId(q.provider);
    if (q.pet) filter.pet = new Types.ObjectId(q.pet);
    if (q.status) {
      const statusArray = q.status.split(',');
      filter.status = { $in: statusArray };
    }
    if (q.q) {
      filter.$or = [
        { reason: { $regex: q.q, $options: 'i' } },
        { location: { $regex: q.q, $options: 'i' } },
        { notes: { $regex: q.q, $options: 'i' } },
      ];
    }
    const dateFromValue = q.dateFrom || q.from;
    const dateToValue = q.to;
    if (dateFromValue || dateToValue) {
      filter.dateTime = {};
      if (dateFromValue)
        (filter.dateTime as any).$gte = new Date(dateFromValue);
      if (dateToValue) (filter.dateTime as any).$lte = new Date(dateToValue);
    }
    if (q.minPrice || q.maxPrice) {
      filter.price = {};
      if (q.minPrice) (filter.price as any).$gte = Number(q.minPrice);
      if (q.maxPrice) (filter.price as any).$lte = Number(q.maxPrice);
    }

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    let sort: Record<string, SortOrder>;
    if (q.sort) {
      sort = { [q.sort]: 1 };
    } else {
      sort =
        q.asc === 'true' ? { dateTime: 1 } : { dateTime: -1, createdAt: -1 };
    }
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('pet', 'name species owner')
        .populate('provider', 'name email city state whatsapp')
        .sort(sort)
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
      .populate('pet', 'name species owner')
      .populate('provider', 'name email city state whatsapp')
      .lean();
    if (!found) throw new NotFoundException('Consulta não encontrada.');
    return found;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    if (dto.pet) await this.assertPet(dto.pet);
    if (dto.provider) await this.assertProvider(dto.provider);
    const payload: any = { ...dto };
    if (dto.dateTime) payload.dateTime = new Date(dto.dateTime);

    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true, lean: true },
    );
    if (!updated) throw new NotFoundException('Consulta não encontrada.');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Consulta não encontrada.');
    return { success: true };
  }

  async removeByPet(petId: string | Types.ObjectId) {
    await this.model.deleteMany({ pet: petId as any });
  }
  async removeByProvider(providerId: string | Types.ObjectId) {
    await this.model.deleteMany({ provider: providerId as any });
  }
}
