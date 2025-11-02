import { PartialType } from '@nestjs/swagger';
import { CreateReminderDto } from './create-reminder.dto.js';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {}
