import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { Pet, PetSchema } from '../pets/schemas/pets.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Provider, ProviderSchema } from '../providers/schemas/provider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Pet.name, schema: PetSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Provider.name, schema: ProviderSchema },
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
