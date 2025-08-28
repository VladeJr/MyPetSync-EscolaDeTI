import { Injectable } from '@nestjs/common';
import { Pet } from './pet.model';

@Injectable()
export class PetsService {
  private pets: Pet[] = []; 

  create(petData: Partial<Pet>): Pet {
    const newPet: Pet = { ...petData } as Pet;
    this.pets.push(newPet);
    return newPet;
  }

  findAll(): Pet[] {
    return this.pets;
  }

  findOne(index: number): Pet {
    return this.pets[index];
  }

  update(index: number, petData: Partial<Pet>): Pet {
    this.pets[index] = { ...this.pets[index], ...petData } as Pet;
    return this.pets[index];
  }

  remove(index: number): void {
    this.pets.splice(index, 1);
  }
}
