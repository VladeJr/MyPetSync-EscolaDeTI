import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard.js';
import { RemindersService } from './reminders.service.js';
import { CreateReminderDto } from './dto/create-reminder.dto.js';
import { UpdateReminderDto } from './dto/update-reminder.dto.js';
import { QueryReminderDto } from './dto/query-reminder.dto.js';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly service: RemindersService) {}

  @Post()
  @ApiOkResponse({ description: 'Cria um lembrete' })
  create(@Req() req: any, @Body() dto: CreateReminderDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista lembretes do usuário' })
  findAll(@Req() req: any, @Query() q: QueryReminderDto) {
    return this.service.findAll(req.user.userId, q);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Obtém um lembrete' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Atualiza um lembrete' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateReminderDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Patch(':id/pause')
  pause(@Req() req: any, @Param('id') id: string) {
    return this.service.pause(req.user.userId, id);
  }

  @Patch(':id/resume')
  resume(@Req() req: any, @Param('id') id: string) {
    return this.service.resume(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Remove um lembrete' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
