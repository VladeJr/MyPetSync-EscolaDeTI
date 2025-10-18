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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';
import { UsersService } from 'src/users/users.service';
import { Tutor } from './schemas/tutor.schema';

@ApiTags('tutors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tutors')
export class TutorsController {
  constructor(
    private readonly tutors: TutorsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('me')
  @ApiOperation({ summary: 'Cria o perfil do tutor para o user logado' })
  @ApiResponse({
    status: 201,
    description: 'Perfil de tutor criado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'User autenticado com sucesso' })
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
  @ApiOperation({ summary: 'Retorna o perfil completo do Tutor logado.' })
  @ApiOkResponse({ description: 'Perfil de Tutor encontrado.', type: Tutor })
  @ApiResponse({ status: 404, description: 'Perfil de tutor não encontrado.' })
  async getMe(@CurrentUser() u: { userId: string }): Promise<Tutor> {
    const tutor = await this.tutors.getByUserId(u.userId);
    if (!tutor) {
      throw new NotFoundException(`Perfil de tutor não encontrado`);
    }

    return tutor;
  }

  @Put('me')
  @ApiOperation({
    summary: 'Atualiza as informações do perfil do Tutor logado.',
  })
  @ApiOkResponse({
    description: 'Perfil de Tutor atualizado com sucesso.',
    type: Tutor,
  })
  @ApiResponse({ status: 404, description: 'Perfil de tutor não encontrado.' })
  async updateMe(
    @CurrentUser() u: { userId: string },
    @Body() dto: UpdateTutorDto,
  ) {
    return this.tutors.updateMine(u.userId, dto);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Remove o perfil de Tutor',
  })
  @ApiOkResponse({ description: 'Perfil de Tutor removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Perfil de tutor não encontrado.' })
  async removeMe(@CurrentUser() u: { userId: string }) {
    return this.tutors.removeMine(u.userId);
  }

  // rota para buscar tutor por id (útil para admin ou perfil público)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tutors.getById(id);
  }
}
