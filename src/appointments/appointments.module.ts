import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { Pet, PetSchema } from '../pets/schemas/pets.schema';
import { Provider, ProviderSchema } from '../providers/schemas/provider.schema';
import { Tutor, TutorSchema } from '../tutors/schemas/tutor.schema';
import { ProvidersModule } from 'src/providers/providers.module';
import { TutorsModule } from 'src/tutors/tutors.module';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Pet.name, schema: PetSchema },
      { name: Provider.name, schema: ProviderSchema },
      { name: Tutor.name, schema: TutorSchema },
    ]),
    forwardRef(() => ProvidersModule),
    TutorsModule,
    PetsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [
    AppointmentsService,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema }
    ]),
  ],
})
export class AppointmentsModule { }
