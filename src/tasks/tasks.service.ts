import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Model, Types } from 'mongoose';
import { PetsService } from 'src/pets/pets.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly petsService: PetsService, // petservice para validar se o pet existe e pertence ao tutor
  ) {}

  async create(tutorId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    await this.petsService.getPetForTutor(tutorId, createTaskDto.petId);

    const createdTask = new this.taskModel({
      ...createTaskDto,
      tutorId: new Types.ObjectId(tutorId),
      petId: new Types.ObjectId(createTaskDto.petId),
      dateTime: new Date(createTaskDto.dateTime),
    });

    return createdTask.save();
  }

  // lista tarefas de um pet específico
  async findAllByPetId(tutorId: string, petId: string): Promise<Task[]> {
    await this.petsService.getPetForTutor(tutorId, petId);

    return this.taskModel.find({ petId }).exec();
  }

  // lista todas as tarefas do tutor em todos os pets
  async findAllByTutor(tutorId: string): Promise<Task[]> {
    return this.taskModel.find({ tutorId }).sort({ dateTime: 1 }).exec();
  }

  // busca tarefa por id
  async findById(tutorId: string, taskId: string): Promise<Task> {
    const task = await this.taskModel
      .findOne({
        _id: taskId,
        tutorId: tutorId,
      })
      .exec();

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada ou acesso negado.');
    }
    return task;
  }

  async update(
    tutorId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const updatedTask = await this.taskModel.findOneAndUpdate(
      { _id: taskId, tutorId: tutorId },
      { ...dto, dateTime: dto.dateTime ? new Date(dto.dateTime) : undefined }, // trata a conversão de data
      { new: true },
    );

    if (!updatedTask) {
      throw new NotFoundException('Tarefa não encontrada ou acesso negado.');
    }
    return updatedTask;
  }

  async delete(tutorId: string, taskId: string): Promise<void> {
    const deletedTask = await this.taskModel.findOneAndDelete({
      _id: taskId,
      tutorId: tutorId,
    });

    if (!deletedTask) {
      throw new NotFoundException('Tarefa não encontrada ou acesso negado.');
    }
  }

  // lógica para importar tarefas para uma agenda/calendário externo - icalendar
}
