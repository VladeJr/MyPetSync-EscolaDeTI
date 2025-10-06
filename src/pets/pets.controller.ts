import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { Pet } from './schemas/pets.schema';
import { UpdatePetDto } from './dto/update-pet.dto';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  async create(@Body() createPetDto: CreatePetDto): Promise<Pet> {
    return this.petsService.create(createPetDto);
  }

  @Get()
  async findAll(): Promise<Pet[]> {
    return this.petsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Pet> {
    return this.petsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.petsService.delete(id);
  }
}
