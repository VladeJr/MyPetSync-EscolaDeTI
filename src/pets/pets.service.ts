import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pet, PetDocument } from './schemas/pets.schema';
import { Model } from 'mongoose';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(@InjectModel(Pet.name) private petModel: Model<PetDocument>) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const createdPet = new this.petModel(createPetDto);
    return createdPet.save();
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.find().exec();
  }

  async findById(id: string): Promise<Pet> {
    const pet = await this.petModel.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const updatedPet = await this.petModel.findByIdAndUpdate(id, updatePetDto);
    if (!updatedPet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }

    return updatedPet;
  }

  async delete(id: string): Promise<void> {
    const deletedPet = await this.petModel.findByIdAndDelete(id);

    if (!deletedPet) {
      throw new NotFoundException(`Pet com id ${id} não encontrado.`);
    }
  }
}
