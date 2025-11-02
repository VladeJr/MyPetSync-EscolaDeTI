import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string) {
    const found = await this.model.findById(new Types.ObjectId(userId)).lean();
    if (!found) throw new NotFoundException('Usuário não encontrado.');
    return found;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const userIdObj = new Types.ObjectId(userId);
    const payload: any = { ...dto };

    if (payload.email) {
      payload.email = payload.email.toLowerCase();

      const conflict = await this.model
        .findOne({ _id: { $ne: userIdObj }, email: payload.email })
        .lean();

      if (conflict) {
        throw new ConflictException(
          'O novo e-mail já está em uso por outro usuário.',
        );
      }
    }

    const update: any = {};
    if (payload.nome) update.nome = payload.nome;
    if (payload.email) update.email = payload.email;

    const updated = await this.model.findByIdAndUpdate(
      userIdObj,
      { $set: update },
      { new: true, runValidators: true, lean: true },
    );

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return updated;
  }

  async updateUserProfile(
    userId: string,
    data: { nome?: string; email?: string },
  ) {
    const userIdObj = new Types.ObjectId(userId);
    const update: any = {};

    if (data.email) {
      const emailLower = data.email.toLowerCase();
      const conflict = await this.model
        .findOne({ _id: { $ne: userIdObj }, email: emailLower })
        .lean();

      if (conflict) {
        throw new ConflictException(
          'O novo e-mail já está em uso por outro usuário.',
        );
      }
      update.email = emailLower;
    }

    if (data.nome) {
      update.nome = data.nome;
    }

    if (Object.keys(update).length === 0) {
      return;
    }

    const updated = await this.model.findByIdAndUpdate(
      userIdObj,
      { $set: update },
      { new: true, runValidators: true, lean: true },
    );

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return updated;
  }
}
