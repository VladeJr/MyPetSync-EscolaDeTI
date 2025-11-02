import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersController } from './reminders.controller.js';
import { RemindersService } from './reminders.service.js';
import { Reminder, ReminderSchema } from './schemas/reminder.schema.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NotificationsModule,
    MongooseModule.forFeature([{ name: Reminder.name, schema: ReminderSchema }]),
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
