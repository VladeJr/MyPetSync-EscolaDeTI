import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByUserId(id: string | Types.ObjectId) {
    return this.userModel.findById(id).select('-senha_hash').lean();
  }

  async updateUser(userId: string, updateData: UpdateUserDto) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true, upsert: false })
      .select('-senha-hash')
      .lean();

    if (!updatedUser) {
      throw new NotFoundException(`Usuário não encontrado`);
    }

    return updatedUser;
  }
}
