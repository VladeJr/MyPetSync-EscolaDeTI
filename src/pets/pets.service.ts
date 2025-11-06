import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pet, PetDocument } from './schemas/pets.schema';
import { Model, Types, FilterQuery } from 'mongoose';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { TutorsService } from '../tutors/tutors.service';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    private readonly tutorsService: TutorsService,
  ) {}

  async create(tutorId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const tutor = await this.tutorsService.getByUserId(tutorId);
    if (!tutor) {
      throw new NotFoundException(
        'Tutor não encontrado. Certifique-se de que o usuário tem um perfil de Tutor.',
      );
    }

    const createdPet = new this.petModel({
      ...createPetDto,
      tutorId: new Types.ObjectId(tutor._id),
    });
    return createdPet.save();
  }

  async searchByName(tutorId: string | null, query: string): Promise<Pet[]> {
    if (!query || query.length < 1) {
      return [];
    }

    const regex = new RegExp(query, 'i');

    const filter: FilterQuery<PetDocument> = { nome: { $regex: regex } };

    if (tutorId) {
      filter.tutorId = new Types.ObjectId(tutorId);
    }

    return this.petModel.find(filter).exec();
  }

  async findAllByTutor(tutorId: string): Promise<Pet[]> {
    return this.petModel.find({ tutorId: new Types.ObjectId(tutorId) }).exec();
  }

  async findById(tutorId: string, id: string): Promise<Pet> {
    const pet = await this.petModel
      .findOne({
        _id: id,
        tutorId: new Types.ObjectId(tutorId),
      })
      .exec();
    if (!pet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return pet;
  }

  async getPetForTutor(tutorId: string, id: string): Promise<PetDocument> {
    const pet = await this.petModel
      .findOne({
        _id: new Types.ObjectId(id),
        tutorId: new Types.ObjectId(tutorId),
      })
      .exec();

    if (!pet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado`);
    }
    return pet;
  }

  async update(
    tutorId: string,
    id: string,
    updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    const updatedPet = await this.petModel.findByIdAndUpdate(
      {
        _id: id,
        tutorId: tutorId,
      },
      updatePetDto,
      { new: true },
    );
    if (!updatedPet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return updatedPet;
  }

  async delete(userId: string, petId: string) {
    const pet = await this.petModel.findOne({
      _id: new Types.ObjectId(petId),
      tutorId: new Types.ObjectId(userId),
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado ou não pertence a este usuário');
    }

    await this.petModel.deleteOne({ _id: pet._id });
    return { message: 'Pet removido com sucesso' };
  }
}
