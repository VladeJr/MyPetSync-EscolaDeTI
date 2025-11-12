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
import { ProvidersService } from 'src/providers/providers.service';
import { PetsService } from '../pets/pets.service';

const petPopulationConfig = {
  path: 'pet',
  select: 'nome tutorId species',
  populate: {
    path: 'tutorId',
    select: 'name _id',
  },
};

const providerPopulationConfig = {
  path: 'provider',
  select: 'name email city state whatsapp',
};

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly model: Model<AppointmentDocument>,
    @InjectModel(Pet.name) private readonly petModel: Model<Pet>,
    @InjectModel(Provider.name)
    private readonly providerModel: Model<Provider>,
    private readonly providersService: ProvidersService,
    private readonly petsService: PetsService,
  ) {}

  private async assertPet(id: string | Types.ObjectId) {
    const ok = await this.petModel.exists({ _id: id });
    if (!ok) throw new NotFoundException('Pet não encontrado.');
  }
  private async assertProvider(id: string | Types.ObjectId) {
    const ok = await this.providerModel.exists({ _id: id });
    if (!ok) throw new NotFoundException('Prestador não encontrado.');
  }

  async getProviderByUser(userId: string) {
    const provider = await this.providersService.findOneByUserId(userId);
    if (!provider) {
      throw new NotFoundException(
        'Perfil de Prestador não encontrado para o usuário logado.',
      );
    }
    return provider;
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

  async findAllByProviderUser(userId: string, q: QueryAppointmentDto) {
    const provider = await this.providersService.findOneByUserId(userId);

    if (!provider) {
      return { items: [], total: 0, page: 1, limit: q.limit || 20, pages: 1 };
    }

    const providerId = (provider._id as Types.ObjectId).toString();

    return this.findAll({ ...q, provider: providerId });
  }

  async findAllByTutorId(tutorId: string, q: QueryAppointmentDto) {
    const pets = await this.petsService.findAllByTutor(tutorId);

    if (pets.length === 0) {
      return {
        items: [],
        total: 0,
        page: q.page || 1,
        limit: q.limit || 20,
        pages: 0,
      };
    }

    const petIds = pets.map((pet: any) => pet._id.toString());
    const petQuery: QueryAppointmentDto = {
      ...q,
      pet: petIds as unknown as string,
    };

    return this.findAll(petQuery);
  }

  async findAll(q: QueryAppointmentDto) {
    const filter: FilterQuery<AppointmentDocument> = {};
    if (q.provider) filter.provider = new Types.ObjectId(q.provider);
    if (q.pet) {
      const petIds = Array.isArray(q.pet) ? q.pet : [q.pet];
      filter.pet = { $in: petIds.map((id) => new Types.ObjectId(id)) };
    }
    if (q.status) {
      const statusValue = q.status;
      const statusArray = Array.isArray(statusValue)
        ? statusValue
        : typeof statusValue === 'string'
          ? statusValue.split(',')
          : [statusValue];

      filter.status = { $in: statusArray };
    }
    if (q.q) {
      filter.$or = [
        { reason: { $regex: q.q, $options: 'i' } },
        { location: { $regex: q.q, $options: 'i' } },
        { notes: { $regex: q.q, $options: 'i' } },
      ];
    }

    const dateToValue = q.to;
    if (q.from || dateToValue) {
      filter.dateTime = {};
      if (q.from) (filter.dateTime as any).$gte = new Date(q.from);
      if (q.to) (filter.dateTime as any).$lte = new Date(q.to);
    }

    if (q.minPrice || q.maxPrice) {
      filter.price = {};
      if (q.minPrice) filter.price.$gte = Number(q.minPrice);
      if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
    }

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const sortAsc: Record<string, SortOrder> =
      q.asc === 'true' ? { dateTime: 1 } : { dateTime: -1, createdAt: -1 };

    let sort: Record<string, SortOrder>;
    if (q.sort) {
      sort = { [q.sort]: 1 };
    } else {
      sort = sortAsc;
    }

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate(petPopulationConfig)
        .populate(providerPopulationConfig)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async countAppointmentsForToday(
    providerId: string,
  ): Promise<{ total: number; confirmed: number }> {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    const providerObjId = new Types.ObjectId(providerId);

    const dateFilter = {
      dateTime: {
        $gte: startOfToday,
        $lt: endOfToday,
      },
    };

    const totalFilter: FilterQuery<AppointmentDocument> = {
      provider: providerObjId,
      ...dateFilter,
      status: { $nin: ['cancelled', 'completed'] },
    };

    const confirmedFilter: FilterQuery<AppointmentDocument> = {
      provider: providerObjId,
      ...dateFilter,
      status: 'confirmed',
    };

    const [total, confirmed] = await Promise.all([
      this.model.countDocuments(totalFilter),
      this.model.countDocuments(confirmedFilter),
    ]);

    return { total, confirmed };
  }

  async findOne(id: string) {
    const found = await this.model
      .findById(id)
      .populate(petPopulationConfig)
      .populate(providerPopulationConfig)
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
