import {
  BadRequestException,
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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';
import { TutorsService } from '../tutors/tutors.service';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller([
  'appointments',
  'pets/:petId/appointments',
  'providers/:providerId/appointments',
])
export class AppointmentsController {
  constructor(
    private readonly service: AppointmentsService,
    private readonly tutorsService: TutorsService,
  ) {}

  @Get('stats/today/:providerId')
  @ApiOkResponse({
    description: 'Contagem de agendamentos para hoje (total e confirmados)',
  })
  countAppointmentsForToday(@Param('providerId') providerId: string) {
    return this.service.countAppointmentsForToday(providerId);
  }

  @Get('stats/clients/:providerId')
  @ApiOkResponse({
    description: 'Contagem total de clientes (tutores) no sistema',
  })
  countAllTutors(@Param('providerId') providerId: string) {
    return this.tutorsService.countAll();
  }

  @Post()
  @ApiOkResponse({ description: 'Consulta criada' })
  create(
    @Body() dto: CreateAppointmentDto,
    @Param('petId') petId?: string,
    @Param('providerId') providerId?: string,
  ) {
    const { pet, provider, ...rest } = dto as any;
    if (petId) {
      if (!dto.provider) {
        throw new BadRequestException(
          'Para criar uma consulta por pet, o ID do provider é obrigatório no corpo.',
        );
      }
      return this.service.createForPet(petId, { provider, ...rest } as Omit<
        CreateAppointmentDto,
        'pet'
      >);
    }
    if (providerId) {
      if (!dto.pet) {
        throw new BadRequestException(
          'Para criar uma consulta por prestador, o ID do pet é obrigatório no corpo.',
        );
      }
      return this.service.createForProvider(providerId, {
        pet,
        ...rest,
      } as Omit<CreateAppointmentDto, 'provider'>);
    }
    if (!dto.pet || !dto.provider) {
      throw new BadRequestException(
        'Na rota global, tanto o ID do pet quanto o ID do prestador são obrigatórios.',
      );
    }

    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista paginada + filtros' })
  findAll(
    @CurrentUser() user: { userId: string },
    @Query() q: QueryAppointmentDto,
    @Param('petId') petId?: string,
    @Param('providerId') providerId?: string,
  ) {
    if (petId || providerId) {
      return this.service.findAll({
        ...q,
        ...(petId ? { pet: petId } : {}),
        ...(providerId ? { provider: providerId } : {}),
      });
    }

    return this.service.findAllByProviderUser(user.userId, q);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Consulta por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Consulta atualizada' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Consulta removida' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
