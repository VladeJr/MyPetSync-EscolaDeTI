import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsModule } from './pets/pets.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
// import { JwtModule } from '@nestjs/jwt'; // JwtModule não é importado aqui
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }), // modulo de config para pegar os dados sensiveis de database e secret key jwt
    // 🛑 REMOVIDO: JwtModule.registerAsync GLOBAL para evitar conflito de configuração.
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
    ReviewsModule, // Mesclado: Módulo ReviewsModule mantido.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
