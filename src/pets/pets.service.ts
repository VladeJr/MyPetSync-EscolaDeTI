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
   
  private async _getTutorDocumentId(userId: string): Promise<string> {
    const tutor = await this.tutorsService.getByUserId(userId);
    if (!tutor) {
      throw new NotFoundException(
        'Tutor não encontrado. Certifique-se de que o usuário tem um perfil de Tutor.',
      );
    }
    return tutor._id.toString(); 
  }

  async create(tutorId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const tutorDocumentId = await this._getTutorDocumentId(tutorId);

    const createdPet = new this.petModel({
      ...createPetDto,
      tutorId: new Types.ObjectId(tutorDocumentId),
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
      try {
        const tutorDocumentId = await this._getTutorDocumentId(tutorId);
        filter.tutorId = new Types.ObjectId(tutorDocumentId);
      } catch (e) {
        return [];
      }
    }

    return this.petModel
      .find(filter)
      .populate({ path: 'tutorId', select: 'name' })
      .exec();
  }

  async findAllByTutor(tutorId: string): Promise<Pet[]> {
    const tutorDocumentId = await this._getTutorDocumentId(tutorId);
    return this.petModel
      .find({ tutorId: new Types.ObjectId(tutorDocumentId) })
      .exec();
  }

  async findById(tutorId: string, id: string): Promise<Pet> {
    const tutorDocumentId = await this._getTutorDocumentId(tutorId);
    const pet = await this.petModel
      .findOne({
        _id: id,
        tutorId: new Types.ObjectId(tutorDocumentId),
      })
      .exec();

    if (!pet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return pet;
  }

  async getPetForTutor(tutorId: string, id: string): Promise<PetDocument> {
    const tutorDocumentId = await this._getTutorDocumentId(tutorId);
    const pet = await this.petModel
      .findOne({
        _id: new Types.ObjectId(id),
        tutorId: new Types.ObjectId(tutorDocumentId), 
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
    const tutorDocumentId = await this._getTutorDocumentId(tutorId);

    const updatedPet = await this.petModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        tutorId: new Types.ObjectId(tutorDocumentId),
      },
      updatePetDto,
      { new: true },
    );

    if (!updatedPet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado ou não pertence a este tutor.`);
    }

    return updatedPet;
  }

  async delete(userId: string, petId: string): Promise<{ message: string }> {
    const tutorDocumentId = await this._getTutorDocumentId(userId);
    const result = await this.petModel.deleteOne({
      _id: new Types.ObjectId(petId),
      tutorId: new Types.ObjectId(tutorDocumentId), 
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Pet não encontrado ou não pertence a este tutor.');
    }
    return { message: 'Pet removido com sucesso' };
  }
}
