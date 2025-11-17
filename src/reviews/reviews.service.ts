import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
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
    if (!Types.ObjectId.isValid(authorId)) {
      throw new BadRequestException('ID de autor inválido');
    }
    if (!Types.ObjectId.isValid(dto.provider)) {
      throw new BadRequestException('ID de provider inválido');
    }
    if (!Types.ObjectId.isValid(dto.appointment)) {
      throw new BadRequestException('ID de appointment inválido');
    }

    const authorObjId = new Types.ObjectId(authorId);
    const providerObjId = new Types.ObjectId(dto.provider);
    const appointmentObjId = new Types.ObjectId(dto.appointment);

    const reviewData = {
      rating: dto.rating,
      comment: dto.comment,
      author: authorObjId,
      provider: providerObjId,
      appointment: appointmentObjId,
    };

    const created = await this.model.create(reviewData); 

    return this.model
      .findById(created._id)
      .populate('author', 'name email')
      .populate('provider', 'name city state')
      .populate('appointment')
      .lean();
  }

  async findAll(q: QueryReviewDto) {
    const filter: FilterQuery<ReviewDocument> = {};

    if (q.provider) {
      if (!Types.ObjectId.isValid(q.provider)) {
        throw new BadRequestException('ID de provider inválido');
      }
      filter.provider = new Types.ObjectId(q.provider);
    }
    
    if (q.author) {
      if (!Types.ObjectId.isValid(q.author)) {
        throw new BadRequestException('ID de autor inválido');
      }
      filter.author = new Types.ObjectId(q.author);
    }
    
    if (q.appointment) {
      if (!Types.ObjectId.isValid(q.appointment)) {
        throw new BadRequestException('ID de appointment inválido');
      }
      filter.appointment = new Types.ObjectId(q.appointment);
    }

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
        .populate('appointment')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Review não encontrada.');
    }

    const found = await this.model
      .findById(new Types.ObjectId(id))
      .populate('author', 'name email')
      .populate('provider', 'name city state')
      .populate('appointment')
      .lean();

    if (!found) throw new NotFoundException('Avaliação não encontrada.');
    return found;
  }

  async update(id: string, authorId: string, dto: UpdateReviewDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Review não encontrada.');
    }
    if (!Types.ObjectId.isValid(authorId)) {
      throw new BadRequestException('ID de autor inválido');
    }

    const review = await this.model.findById(new Types.ObjectId(id));
    if (!review) throw new NotFoundException('Avaliação não encontrada.');
    
    if (review.author.toString() !== authorId) {
      throw new ForbiddenException('Você só pode editar suas próprias avaliações.');
    }

    Object.assign(review, dto);
    await review.save();
    
    return this.model
      .findById(review._id)
      .populate('author', 'name email')
      .populate('provider', 'name city state')
      .populate('appointment')
      .lean();
  }

  async remove(id: string, authorId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Review não encontrada.');
    }
    if (!Types.ObjectId.isValid(authorId)) {
      throw new BadRequestException('ID de autor inválido');
    }

    const review = await this.model.findById(new Types.ObjectId(id));
    if (!review) throw new NotFoundException('Avaliação não encontrada.');
    
    if (review.author.toString() !== authorId) {
      throw new ForbiddenException('Você só pode excluir suas próprias avaliações.');
    }

    await review.deleteOne();
    return { success: true };
  }
}