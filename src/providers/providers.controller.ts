import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryProviderDto } from './dto/query-provider.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { QueryAppointmentDto } from 'src/appointments/dto/query-appointment.dto';
import { QueryServiceDto } from 'src/services/dto/query-service.dto';
import { ServicesService } from 'src/services/services.service';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { Types } from 'mongoose';

@ApiTags('providers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly service: ProvidersService,
    private readonly appointmentsService: AppointmentsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do Prestador logado.' })
  @ApiOkResponse({ description: 'Perfil do Prestador.' })
  async findMe(@CurrentUser() u: { userId: string }) {
    return this.service.findOneByUserId(u.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza perfil do negócio do Prestador logado' })
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso' })
  async updateMe(
    @CurrentUser() u: { userId: string },
    @Body() dto: UpdateProviderDto,
  ) {
    return this.service.updateMine(u.userId, dto);
  }

  // tratará do recurso autenticado - prestador logado
  @Get('/me/appointments')
  @ApiOperation({
    summary: 'Lista a agenda de consultas do Prestador logado (via JWT).',
  })
  @ApiOkResponse({ description: 'Lista paginada e filtrada de agendamentos.' })
  async findAllMyAppointments(
    @CurrentUser() user: { userId: string },
    @Query() q: QueryAppointmentDto,
  ) {
    return this.appointmentsService.findAllByProviderUser(user.userId, q);
  }

  @Get('/me/services')
  @ApiOperation({
    summary: 'Lista os serviços do Prestador logado (via JWT).',
  })
  @ApiOkResponse({ description: 'Lista paginada e filtrada de serviços.' })
  async findAllMyServices(
    @CurrentUser() user: { userId: string },
    @Query() q: QueryServiceDto,
  ) {
    return this.servicesService.findAllByProviderUser(user.userId, q);
  }

  @Post('/me/services')
  @ApiOperation({ summary: 'Cria um novo serviço para o Prestador logado.' })
  @ApiOkResponse({ description: 'Serviço criado com sucesso.' })
  async createService(
    @CurrentUser() user: { userId: string },
    @Body() dto: Omit<CreateServiceDto, 'provider'>,
  ) {
    const provider = await this.service.findOneByUserId(user.userId);
    const createDto: CreateServiceDto = {
      ...dto,
      provider: (provider._id as Types.ObjectId).toHexString(),
    } as CreateServiceDto;

    return this.servicesService.create(createDto);
  }

  @Post()
  @ApiOperation({ summary: 'Cria novo Prestador de Serviço' })
  @ApiOkResponse({ description: 'Prestador criado' })
  async create(@Body() dto: CreateProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista paginada de prestadores' })
  @ApiOkResponse({ description: 'Lista paginada + filtros' })
  async findAll(@Query() q: QueryProviderDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca prestador por ID' })
  @ApiOkResponse({ description: 'Prestador por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza prestador por ID' })
  @ApiOkResponse({ description: 'Prestador atualizado' })
  async update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove prestador por ID' })
  @ApiOkResponse({ description: 'Prestador removido' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
