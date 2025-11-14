import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, SortOrder } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly model: Model<ReviewDocument>,
  ) {}

  async getAverageRatingByProvider(providerId: string): Promise<{ average: number; count: number }> {
    const providerObjId = new Types.ObjectId(providerId);

    const result = await this.model.aggregate([
      { $match: { provider: providerObjId } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) return { average: 0.0, count: 0 };

    const { average, count } = result[0];
    return { average: parseFloat(average.toFixed(1)), count };
  }

  async findRecentByProvider(providerId: string, limit = 5) {
    const providerObjId = new Types.ObjectId(providerId);
    return this.model
      .find({ provider: providerObjId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name')
      .lean();
  }

  async create(authorId: string, dto: CreateReviewDto) {
    const authorObjId = new Types.ObjectId(authorId);

    if (!dto.provider && !dto.service) {
      throw new NotFoundException('É necessário informar provider ou service.');
    }

    const data: any = { ...dto, author: authorObjId };
    if (dto.provider) data.provider = new Types.ObjectId(dto.provider);
    if (dto.service) data.service = new Types.ObjectId(dto.service);

    const filter: FilterQuery<ReviewDocument> = { author: authorObjId };
    if (data.provider) filter.provider = data.provider;
    if (data.service) filter.service = data.service;

    const existingReview = await this.model.findOne(filter);
    if (existingReview) {
      throw new ConflictException('Você já enviou uma avaliação para este item.');
    }

    const created = await this.model.create(data);

    return this.model
      .findById(created._id)
      .populate('author', 'name email')
      .populate('provider', 'name city state')
      .populate('service', 'name price')
      .lean();
  }

  async findAll(q: QueryReviewDto) {
    const filter: FilterQuery<ReviewDocument> = {};
    if (q.provider) filter.provider = new Types.ObjectId(q.provider);
    if (q.service) filter.service = new Types.ObjectId(q.service);

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;
    const sort: { [key: string]: SortOrder } = {
      createdAt: q.order === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('author', 'name email')
        .populate('provider', 'name city state')
        .populate('service', 'name price')
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
      .populate('author', 'name email')
      .populate('provider', 'name city state')
      .populate('service', 'name price')
      .lean();

    if (!found) throw new NotFoundException('Avaliação não encontrada.');
    return found;
  }

  async update(id: string, authorId: string, dto: UpdateReviewDto) {
    const review = await this.model.findById(id);
    if (!review) throw new NotFoundException('Avaliação não encontrada.');
    if (review.author.toString() !== authorId) {
      throw new ForbiddenException('Você só pode editar suas próprias avaliações.');
    }
    Object.assign(review, dto);
    await review.save();
    return review.toObject();
  }

  async remove(id: string, authorId: string) {
    const review = await this.model.findById(id);
    if (!review) throw new NotFoundException('Avaliação não encontrada.');
    if (review.author.toString() !== authorId) {
      throw new ForbiddenException('Você só pode excluir suas próprias avaliações.');
    }
    await review.deleteOne();
    return { success: true };
  }
}
