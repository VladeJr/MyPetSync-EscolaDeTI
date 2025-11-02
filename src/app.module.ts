import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsModule } from './pets/pets.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { TutorsModule } from './tutors/tutors.module';
import { TasksModule } from './tasks/tasks.module';
import { ProvidersModule } from './providers/providers.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MailModule } from './mail/mail.module';
import { ExamsModule } from './exams/exams.module';
import { FilesModule } from './files/files.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('database.connectionString'),
      }),
    }),

    TutorsModule,
    PetsModule,
    AuthModule,
    TasksModule,
    ProvidersModule,
    ServicesModule,
    UsersModule,
    AppointmentsModule,
    MailModule,
    ExamsModule,
    FilesModule,
    ReviewsModule,
    NotificationsModule,
    RemindersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
