import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tutor, TutorSchema } from './schemas/tutor.schema';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tutor.name, schema: TutorSchema }]),
  ],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
