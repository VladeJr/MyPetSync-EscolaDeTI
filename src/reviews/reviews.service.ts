import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, SortOrder } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private readonly model: Model<ReviewDocument>) {}

  async create(authorId: string, dto: CreateReviewDto) {
    const data: any = {
      ...dto,
      author: new Types.ObjectId(authorId),
    };
    if (!dto.provider && !dto.service) {
      throw new NotFoundException('É necessário informar provider ou service.');
    }
    const created = await this.model.create(data);
    return created.toObject();
  }

  async findAll(q: QueryReviewDto) {
    const filter: FilterQuery<ReviewDocument> = {};
    if (q.provider) filter.provider = new Types.ObjectId(q.provider);
    if (q.service) filter.service = new Types.ObjectId(q.service);

    const page = Math.max(parseInt(q.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(q.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;
    const sort: { [key: string]: SortOrder } = { createdAt: q.order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('author', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const found = await this.model.findById(id)
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
