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

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller([
  'appointments',
  'pets/:petId/appointments',
  'providers/:providerId/appointments',
])
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  @ApiOkResponse({ description: 'Consulta criada' })
  create(
    @Body() dto: CreateAppointmentDto,
    @Param('petId') petId?: string,
    @Param('providerId') providerId?: string,
  ) {
    const { pet, provider, ...rest } = dto as any;
    // rota aninhada de Pet: usa petId do path
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
    // rota aninhada de Provider: usa providerId do path
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
    // (/appointments): ambos devem estar no body
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
    @Query() q: QueryAppointmentDto,
    @Param('petId') petId?: string,
    @Param('providerId') providerId?: string,
  ) {
    return this.service.findAll({
      ...q,
      ...(petId ? { pet: petId } : {}),
      ...(providerId ? { provider: providerId } : {}),
    });
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
