import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationToken, NotificationTokenSchema } from './schemas/notification-token.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: NotificationToken.name, schema: NotificationTokenSchema }])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
