import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pet, PetDocument } from './schemas/pets.schema';
import { Model, Types } from 'mongoose';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(@InjectModel(Pet.name) private petModel: Model<PetDocument>) {}

  async create(tutorId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const createdPet = new this.petModel({
      ...createPetDto,
      tutorId: new Types.ObjectId(tutorId), // add tutorId
    });
    return createdPet.save();
  }
  // filtra todos os pets por tutor
  async findAllByTutor(tutorId: string): Promise<Pet[]> {
    return this.petModel.find({ tutorId: tutorId }).exec();
  }

  async findById(tutorId: string, id: string): Promise<Pet> {
    const pet = await this.petModel
      .findOne({
        _id: id,
        tutorId: tutorId,
      })
      .exec();
    if (!pet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return pet;
  }

  // método auxiliar para usar no TaskService, validação de segurança
  async getPetForTutor(tutorId: string, id: string): Promise<PetDocument> {
    const pet = await this.petModel
      .findOne({
        _id: id,
        tutorId: tutorId,
      })
      .exec();

    if (!pet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado`);
    }
    return pet;
  }

  async update(
    tutorId: string, // garante que o pet pertence ao tutor antes de atualizar
    id: string,
    updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    const updatedPet = await this.petModel.findByIdAndUpdate(
      {
        _id: id,
        tutorId: tutorId,
      },
      updatePetDto,
      { new: true }, // retorna o documento atualizado
    );
    if (!updatedPet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return updatedPet;
  }

  async delete(tutorId: string, id: string): Promise<void> {
    const deletedPet = await this.petModel.findByIdAndDelete({
      _id: id,
      tutorId: tutorId,
    });

    if (!deletedPet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }
  }
}
