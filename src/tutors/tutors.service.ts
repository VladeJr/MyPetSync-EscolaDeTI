import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tutor, TutorDocument } from './schemas/tutor.schema';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class TutorsService {
  constructor(
    @InjectModel(Tutor.name) private readonly model: Model<TutorDocument>,
  ) {}

  async countAll(): Promise<number> {
    return this.model.countDocuments({});
  }

  async createForUser(userId: string, name: string, dto: CreateTutorDto) {
    return this.model.create({
      ...dto,
      name,
      userId: new Types.ObjectId(userId),
    });
  }

  async getByUserId(userId: string) {
    const tutor = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    return tutor;
  }

  async findById(id: string) {
    const tutor = await this.model.findById(id).lean();
    if (!tutor) throw new NotFoundException('Tutor não encontrado');
    return tutor;
  }

  async updateMine(userId: string, dto: UpdateTutorDto) {
    const updated = await this.model
      .findOneAndUpdate({ userId: new Types.ObjectId(userId) }, dto, {
        new: true,
        upsert: false,
      })
      .lean();
    if (!updated) throw new NotFoundException('Tutor não encontrado');
    return updated;
  }

  async removeMine(userId: string) {
    const res = await this.model.deleteOne({
      userId: new Types.ObjectId(userId),
    });
    if (res.deletedCount === 0)
      throw new NotFoundException('Tutor não encontrado');
    return { ok: true };
  }

  async listAll(limit = 50, page = 1) {
    return this.model
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async listAddresses(userId: string) {
    const tutor = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    if (!tutor) throw new NotFoundException('Tutor não encontrado');
    return tutor.addresses;
  }

  async addAddress(userId: string, addressDto: any) {
    const tutor = await this.model.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!tutor) throw new NotFoundException('Tutor não encontrado');

    tutor.addresses.push(addressDto);
    await tutor.save();

    return tutor.addresses;
  }

  async deleteAddress(userId: string, addressId: string) {
    const userIdObj = new Types.ObjectId(userId);

    const result = await this.model.updateOne(
      { userId: userIdObj },
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Tutor não encontrado');
    }
    return { message: 'Endereço removido com sucesso' };
  }

  async updateAddress(
    userId: string,
    addressId: string,
    addressDto: UpdateAddressDto,
  ) {
    const tutor = await this.model.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!tutor) throw new NotFoundException('Tutor não encontrado');
    const addresses = tutor.addresses as any;
    const addressIndex = addresses.findIndex(
      (addr: any) => addr._id.toString() === addressId,
    );
    if (addressIndex === -1) {
      throw new NotFoundException('Endereço não encontrado');
    }

    addresses[addressIndex] = {
      ...addresses[addressIndex].toObject(),
      ...addressDto,
    };
    await tutor.save();

    return {
      message: 'Endereço atualizado com sucesso',
      address: addresses[addressIndex],
    };
  }
}
