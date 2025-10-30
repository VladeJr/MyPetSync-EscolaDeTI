import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import {
  Provider,
  ProviderDocument,
} from '../providers/schemas/provider.schema';
import { ProvidersService } from 'src/providers/providers.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private readonly model: Model<ServiceDocument>,
    @InjectModel(Provider.name)
    private readonly providerModel: Model<ProviderDocument>,
    private readonly providersService: ProvidersService,
  ) {}

  private async assertProvider(providerId: string | Types.ObjectId) {
    const exists = await this.providerModel.exists({ _id: providerId as any });
    if (!exists) throw new NotFoundException('Prestador não encontrado.');
  }

  async create(dto: CreateServiceDto) {
    await this.assertProvider(dto.provider);
    // Validar unicidade (provider + name)
    const conflict = await this.model.exists({
      provider: dto.provider,
      name: dto.name,
    });
    if (conflict)
      throw new ConflictException(
        'Este prestador já possui um serviço com esse nome.',
      );
    const created = await this.model.create(dto);
    return created.toObject();
  }

  async createForProvider(
    providerId: string,
    payload: Omit<CreateServiceDto, 'provider'>,
  ) {
    return this.create({ ...payload, provider: providerId });
  }

  async findAll(q: QueryServiceDto) {
    const filter: FilterQuery<ServiceDocument> = {};

    if (q.provider) filter.provider = new Types.ObjectId(q.provider);
    if (q.category) filter.category = q.category;
    if (typeof q.active !== 'undefined') filter.isActive = q.active === 'true';

    if (q.q) {
      // text index (name/description)
      filter.$text = { $search: q.q };
    }

    if (q.minPrice || q.maxPrice) {
      filter.price = {};
      if (q.minPrice) filter.price.$gte = Number(q.minPrice);
      if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
    }

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const sort: Record<string, SortOrder> = {
      createdAt: q.order === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('provider', 'name email city state isActive')
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
      .populate('provider', 'name email city state isActive')
      .lean();
    if (!found) throw new NotFoundException('Serviço não encontrado.');
    return found;
  }

  async update(id: string, dto: UpdateServiceDto) {
    if (dto.provider) {
      await this.assertProvider(dto.provider);
    }

    if (dto.name || dto.provider) {
      const current = await this.model.findById(id).lean();
      if (!current) throw new NotFoundException('Serviço não encontrado.');
      const providerId = dto.provider ?? String(current.provider);
      const name = dto.name ?? current.name;
      const conflict = await this.model.exists({
        _id: { $ne: id },
        provider: providerId,
        name,
      });
      if (conflict)
        throw new ConflictException(
          'Este prestador já possui um serviço com esse nome.',
        );
    }

    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true, lean: true },
    );
    if (!updated) throw new NotFoundException('Serviço não encontrado.');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Serviço não encontrado.');
    return { success: true };
  }

  async removeByProvider(providerId: string | Types.ObjectId) {
    await this.model.deleteMany({ provider: providerId as any });
  }

  async findAllByProviderUser(userId: string, q: QueryServiceDto) {
    const provider = await this.providersService.findOneByUserId(userId);
    const providerId = (provider._id as Types.ObjectId).toHexString();

    return this.findAll({ ...q, provider: providerId });
  }
}
