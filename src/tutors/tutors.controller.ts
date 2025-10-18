import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';
import { UsersService } from 'src/users/users.service';
import { Tutor } from './schemas/tutor.schema';

@ApiTags('tutors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutors')
export class TutorsController {
  constructor(
    private readonly tutors: TutorsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('me')
  async createMe(
    @CurrentUser() u: { userId: string },
    @Body() dto: CreateTutorDto,
  ) {
    const user = await this.usersService.findByUserId(u.userId);
    if (!user) {
      throw new NotFoundException(`Usuário autenticado não encontrado`);
    }

    return this.tutors.createForUser(u.userId, user.nome, dto);
  }

  @Get('me')
  async getMe(@CurrentUser() u: { userId: string }): Promise<Tutor> {
    const tutor = await this.tutors.getByUserId(u.userId);
    if (!tutor) {
      throw new NotFoundException(`Perfil de tutor não encontrado`);
    }

    return tutor;
  }

  @Put('me')
  async updateMe(
    @CurrentUser() u: { userId: string },
    @Body() dto: UpdateTutorDto,
  ) {
    return this.tutors.updateMine(u.userId, dto);
  }

  @Delete('me')
  async removeMe(@CurrentUser() u: { userId: string }) {
    return this.tutors.removeMine(u.userId);
  }

  // rota para buscar tutor por id (útil para admin ou perfil público)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tutors.getById(id);
  }
}
