import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PetsService } from './pets.service';
import type { Pet } from './pet.model';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@Body() petData: Partial<Pet>) {
    return this.petsService.create(petData);
  }

  @Get()
  findAll(): Pet[] {
    return this.petsService.findAll();
  }

  @Get(':index')
  findOne(@Param('index') index: string): Pet {
    return this.petsService.findOne(Number(index));
  }

  @Put(':index')
  update(@Param('index') index: string, @Body() petData: Partial<Pet>): Pet {
    return this.petsService.update(Number(index), petData);
  }

  @Delete(':index')
  remove(@Param('index') index: string) {
    this.petsService.remove(Number(index));
    return { message: `Pet ${index} removido` };
  }
}
