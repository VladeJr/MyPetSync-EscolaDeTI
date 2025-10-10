import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';

@ApiTags('pets-tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova tarefa para um pet específico.' })
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
  async findAllByPet(
    @CurrentUser() user: { userId: string },
    @Param('petId') petId: string,
  ) {
    return this.tasksService.findAllByPetId(user.userId, petId);
  }

  @Get('/all')
  @ApiOperation({ summary: 'busca tarefa por id' })
  async findOne(
    @CurrentUser() user: { userId: string },
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findById(user.userId, taskId);
  }

  @Put(':taskId')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('taskId') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.userId, id, updateTaskDto);
  }

  @Delete(':taskId')
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('taskId') id: string,
  ) {
    await this.tasksService.delete(user.userId, id);
    return { message: `Tarefa ${taskId} removida com sucesso.` };
  }
}
