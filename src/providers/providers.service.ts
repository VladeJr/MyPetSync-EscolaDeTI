import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  Provider,
  ProviderDocument,
  ProviderType,
} from './schemas/provider.schema';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryProviderDto } from './dto/query-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectModel(Provider.name) private readonly model: Model<ProviderDocument>,
  ) {}

  async createForUser(
    userId: string,
    email: string,
    name: string,
    type: ProviderType,
    cpf?: string,
    cnpj?: string,
  ) {
    const exists = await this.model.findOne({ userId });
    if (exists) {
      throw new ConflictException('Perfil de prestador já existe.');
    }

    const created = await this.model.create({
      userId: new Types.ObjectId(userId),
      name: name,
      email: email.toLowerCase(),
      type: type,
      cpf: cpf,
      cnpj: cnpj,
    });

    return created.toObject();
  }

  async create(dto: CreateProviderDto) {
    const email = dto.email.toLowerCase();
    const exists = await this.model.findOne({ email }).lean();
    if (exists)
      throw new ConflictException('Email já cadastrado para um prestador.');
    const created = await this.model.create({
      ...dto,
      email,
      state: dto.state?.toUpperCase(),
    });
    return created.toObject();
  }

  async findAll(q: QueryProviderDto) {
    const filter: FilterQuery<ProviderDocument> = {};
    if (q.city) filter.city = { $regex: q.city, $options: 'i' };
    if (q.state) filter.state = q.state.toUpperCase();
    if (typeof q.active !== 'undefined') filter.isActive = q.active === 'true';
    if (q.service)
      filter.servicesOffered = {
        $elemMatch: { $regex: q.service, $options: 'i' },
      };
    if (q.q) filter.name = { $regex: q.q, $options: 'i' };
    if (q.type) filter.type = q.type; // filtro por tipo autonomo ou company

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const found = await this.model.findById(id).lean();
    if (!found) throw new NotFoundException('Prestador não encontrado.');
    return found;
  }

  async update(id: string, dto: UpdateProviderDto) {
    if (dto.email) {
      const email = dto.email.toLowerCase();
      const conflict = await this.model
        .findOne({ _id: { $ne: id }, email })
        .lean();
      if (conflict)
        throw new ConflictException(
          'Email já cadastrado para outro prestador.',
        );
      dto.email = email;
    }
    if (dto.state) dto.state = dto.state.toUpperCase();

    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true, lean: true },
    );
    if (!updated) throw new NotFoundException('Prestador não encontrado.');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Prestador não encontrado.');
    return { success: true };
  }
}
