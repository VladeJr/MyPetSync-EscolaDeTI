import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';

@ApiTags('tutors')
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo perfil de tutor' })
  async create(
    @CurrentUser() user: { userId: string; name: string },
    @Body() dto: CreateTutorDto,
  ) {
    return this.tutorsService.createForUser(user.userId, user.name, dto);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna o perfil do tutor logado' })
  @ApiOkResponse({ description: 'Retorna o perfil do tutor.' })
  async getMine(@CurrentUser() user: { userId: string }) {
    return this.tutorsService.getByUserId(user.userId);
  }

  @Put('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza o perfil do tutor logado' })
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso.' })
  async updateMine(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateTutorDto,
  ) {
    return this.tutorsService.updateMine(user.userId, dto);
  }

  @Delete('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove o perfil do tutor logado' })
  @ApiOkResponse({ description: 'Perfil removido com sucesso.' })
  async removeMine(@CurrentUser() user: { userId: string }) {
    return this.tutorsService.removeMine(user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os tutores (apenas para Admin)' })
  @ApiOkResponse({ description: 'Retorna a lista de tutores.' })
  async listAll(@Query('limit') limit: number, @Query('page') page: number) {
    return this.tutorsService.listAll(limit, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um tutor por ID' })
  @ApiOkResponse({ description: 'Retorna o tutor encontrado.' })
  async getTutorById(@Param('id') id: string) {
    return this.tutorsService.findById(id);
  }
}
