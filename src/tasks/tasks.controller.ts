import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  NotFoundException,
  InternalServerErrorException,
  Res,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';
import type { Response } from 'express';

@ApiTags('pets-tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova tarefa para um pet específico.' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pet não encontrado ou acesso negado.',
  })
  async create(
    @CurrentUser() user: { userId: string },
    @Param('petId') petId: string,
    @Body() createTaskDto: Omit<CreateTaskDto, 'petId'>, // recebe do body sem o petId que já vem do URL pets/:petId/tasks
  ) {
    return this.tasksService.create(user.userId, { ...createTaskDto, petId });
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todas as tarefas de um pet específico para o tutor',
  })
  @ApiOkResponse({ description: 'Retorna a lista de tarefas do pet.' })
  async findAllByPet(
    @CurrentUser() user: { userId: string },
    @Param('petId') petId: string,
  ) {
    return this.tasksService.findAllByPetId(user.userId, petId);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Busca tarefa por ID' })
  async findOne(
    @CurrentUser() user: { userId: string },
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findById(user.userId, taskId);
  }

  @Put(':taskId')
  @ApiOperation({ summary: 'Atualiza tarefa por ID' })
  async update(
    @CurrentUser() user: { userId: string },
    @Param('taskId') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.userId, id, updateTaskDto);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Remove tarefa por ID' })
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('taskId') taskId: string,
  ) {
    await this.tasksService.delete(user.userId, taskId);
    return { message: `Tarefa ${taskId} removida com sucesso.` };
  }

  // exportação agenda/calendario icalendar
  @Get('export/ical')
  @ApiOperation({
    summary: 'exporta a agenda de tarefas do pet p um arquivo iCalendar (.ics)',
  })
  @ApiProduces('text/calendar') // documenta que o retorno é um arquivo .ics
  @ApiResponse({
    status: 200,
    description: 'Retorna um arquivo .ics para download.',
  })
  async exportCalendar(
    @CurrentUser() user: { userId: string },
    @Param('petId') petId: string,
    @Res() res: Response,
  ) {
    try {
      const icalContent = await this.tasksService.exportToIcal(
        user.userId,
        petId,
      );

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader(
        `Content-Disposition`,
        `attachment; filename= "pet-agenda-${petId}.ics"`,
      );
      res.send(icalContent);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Falha ao gerar arquivo de calendário',
      );
    }
  }
}
