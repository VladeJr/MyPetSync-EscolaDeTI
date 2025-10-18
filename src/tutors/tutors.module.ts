import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tutor, TutorSchema } from './schemas/tutor.schema';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tutor.name, schema: TutorSchema }]),
    UsersModule,
  ],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
