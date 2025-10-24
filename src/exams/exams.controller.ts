import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
/** Atende:
 *  - /exams
 *  - /pets/:petId/exams
 *  - /appointments/:appointmentId/exams
 */
@Controller(['exams', 'pets/:petId/exams', 'appointments/:appointmentId/exams'])
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Post()
  @ApiOkResponse({ description: 'Exame criado' })
  create(
    @Body() dto: CreateExamDto,
    @Param('petId') petId?: string,
    @Param('appointmentId') appointmentId?: string,
  ) {
    if (petId) {
      const { pet, ...payload } = dto as any;
      return this.service.createForPet(petId, { ...payload, appointment: appointmentId });
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista paginada + filtros' })
  findAll(
    @Query() q: QueryExamDto,
    @Param('petId') petId?: string,
    @Param('appointmentId') appointmentId?: string,
  ) {
    return this.service.findAll({
      ...q,
      ...(petId ? { pet: petId } : {}),
      ...(appointmentId ? { appointment: appointmentId } : {}),
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Exame por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Exame atualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Exame removido' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
