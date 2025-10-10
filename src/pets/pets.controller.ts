import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { Pet } from './schemas/pets.schema';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() createPetDto: CreatePetDto,
  ): Promise<Pet> {
    return this.petsService.create(user.userId, createPetDto);
  }

  @Get()
  async findAll(@CurrentUser() user: { userId: string }): Promise<Pet[]> {
    return this.petsService.findAllByTutor(user.userId);
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<Pet> {
    return this.petsService.findById(user.userId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petsService.update(user.userId, id, updatePetDto);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<void> {
    return await this.petsService.delete(user.userId, id);
  }
}
