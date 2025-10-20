import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsModule } from './pets/pets.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { JwtModule } from '@nestjs/jwt';
import { TutorsModule } from './tutors/tutors.module';
import { TasksModule } from './tasks/tasks.module';
import { ProvidersModule } from './providers/providers.module';
import { ServicesModule } from './services/services.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }), // modulo de config para pegar os dados sensiveis de database e secret key jwt

    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
      }),
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
    AppointmentsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
