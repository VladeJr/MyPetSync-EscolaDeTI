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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';

@ApiTags('pets')
@ApiBearerAuth('acess-token')
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pet para o user autenticado' })
  @ApiResponse({ status: 201, description: 'Pet criado com sucesso.' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() createPetDto: CreatePetDto,
  ): Promise<Pet> {
    return this.petsService.create(user.userId, createPetDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os pets pertencentes ao user autenticado.',
  })
  @ApiOkResponse({ description: 'Retorna a lista de pets.' })
  async findAll(@CurrentUser() user: { userId: string }): Promise<Pet[]> {
    return this.petsService.findAllByTutor(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um pet por ID (somente se pertencer ao tutor logado)',
  })
  @ApiParam({ name: 'id', description: 'ID do pet' })
  async findById(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<Pet> {
    return this.petsService.findById(user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza pet por ID' })
  @ApiOkResponse({ description: 'Pet atualizado com sucesso' })
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petsService.update(user.userId, id, updatePetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove pet por ID' })
  @ApiOkResponse({ description: 'Pet removido com sucesso' })
  async delete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<void> {
    return await this.petsService.delete(user.userId, id);
  }
}
