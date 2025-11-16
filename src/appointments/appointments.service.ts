import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, SortOrder } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { Pet } from '../pets/schemas/pets.schema';
import {
  Provider,
} from '../providers/schemas/provider.schema';
import { ProvidersService } from 'src/providers/providers.service';
import { PetsService } from '../pets/pets.service';

// ✅ VOLTAR para tutorId (compatibilidade com frontend)
const petPopulationConfig = {
  path: 'pet',
  select: 'nome tutorId species',
  populate: {
    path: 'tutorId', // ✅ VOLTAR para tutorId
    select: 'name _id',
  },
};

const providerPopulationConfig = {
  path: 'provider',
  select: 'name email city state whatsapp',
};

const servicePopulationConfig = {
  path: 'service',
  select: 'name price duration',
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
  ) { }

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

  // ✅ MANTER: Método original com tutorId
  async findAllByTutorId(tutorId: string, q: QueryAppointmentDto) {
    console.log('🔍 Buscando agendamentos para tutorId:', tutorId);
    console.log('🔍 Query params:', q);

    // ✅ VOLTAR: Usar findAllByTutor (método original)
    const pets = await this.petsService.findAllByTutor(tutorId);

    console.log('🐕 Pets encontrados:', pets.map((p: any) => ({ 
      id: p._id, 
      nome: p.nome,
      tutorId: p.tutorId // ✅ VOLTAR para tutorId
    })));

    if (pets.length === 0) {
      console.log('⚠️ Nenhum pet encontrado para este tutor!');
      return {
        items: [],
        total: 0,
        page: q.page || 1,
        limit: q.limit || 20,
        pages: 0,
      };
    }

    const petIds = pets.map((pet: any) => pet._id.toString());
    console.log('🔗 Pet IDs que serão usados no filtro:', petIds);
    
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
      console.log('🔍 Pet IDs recebidos no findAll:', petIds);
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

    console.log('📋 Filter aplicado:', JSON.stringify(filter, null, 2));

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

    console.log('🔍 Skip:', skip, 'Limit:', limit, 'Sort:', JSON.stringify(sort));

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate(petPopulationConfig) // ✅ Já está corrigido
        .populate(providerPopulationConfig)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    console.log('📊 Total no banco:', total, 'Retornados com limit:', items.length);

    // ✅ TESTE: Busca SEM limit para ver todos os registros
    const allItems = await this.model
      .find(filter)
      .populate(petPopulationConfig)
      .populate(providerPopulationConfig)
      .sort(sort)
      .lean();

    console.log('📊 TESTE SEM LIMIT/SKIP:', allItems.length);
    allItems.forEach((i: any) => {
      console.log(`   - ${i._id} (status: ${i.status}, dia: ${new Date(i.dateTime).getDate()}, pet: ${i.pet?.nome})`);
    });

    console.log('✅ Agendamentos encontrados:', items.length);
    console.log('✅ Datas dos agendamentos:', items.map((i: any) => ({
      id: i._id,
      dateTime: i.dateTime,
      dia: new Date(i.dateTime).getDate(),
      pet: i.pet?._id,
      petNome: i.pet?.nome,
      // ✅ VOLTAR: Mostrar tutorId do pet
      petTutorId: i.pet?.tutorId?._id || i.pet?.tutorId
    })));

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
      .populate(petPopulationConfig) // ✅ Já está corrigido
      .populate(providerPopulationConfig)
      .populate(servicePopulationConfig)
      .lean();
    if (!found) throw new NotFoundException('Consulta não encontrada.');
    return found; 
  }

  async updateAppointmentStatus(
    id: string,
    updateData: { isRated: boolean } | { status: string }
  ): Promise<void> {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true, lean: true },
    );
    if (!updated) throw new NotFoundException('Agendamento não encontrado para atualização de status.');
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    if (dto.pet) await this.assertPet(dto.pet);
    if (dto.provider) await this.assertProvider(dto.provider);
    
    console.log('🔍 ANTES da atualização - Agendamento:', id);
    const antes = await this.model.findById(id).lean();
    console.log('   Pet:', antes?.pet);
    console.log('   Status:', antes?.status);
    
    const payload: any = {};
    
    // Apenas incluir campos que estão presentes no DTO
    if (dto.dateTime !== undefined) {
      payload.dateTime = new Date(dto.dateTime);
    }
    if (dto.duration !== undefined) payload.duration = dto.duration;
    if (dto.reason !== undefined) payload.reason = dto.reason;
    if (dto.location !== undefined) payload.location = dto.location;
    if (dto.price !== undefined) payload.price = dto.price;
    if (dto.status !== undefined) payload.status = dto.status;
    if (dto.notes !== undefined) payload.notes = dto.notes;
    if (dto.email !== undefined) payload.email = dto.email;
    if (dto.phone !== undefined) payload.phone = dto.phone;
    if (dto.pet !== undefined) payload.pet = new Types.ObjectId(dto.pet);
    if (dto.provider !== undefined) payload.provider = new Types.ObjectId(dto.provider);
    
    // ✅ service existe no DTO
    if (dto.service !== undefined) {
      payload.service = dto.service ? new Types.ObjectId(dto.service) : null;
    }

    console.log('📝 Payload de atualização:', payload);

    const updated = await this.model.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: payload },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    )
      .populate(petPopulationConfig)
      .populate(providerPopulationConfig)
      .populate(servicePopulationConfig)
      .lean();
    
    console.log('✅ DEPOIS da atualização - Agendamento:', id);
    console.log('   Pet:', updated?.pet?._id);
    console.log('   Status:', updated?.status);
    console.log('   Encontrado no banco?', !!updated);
      
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