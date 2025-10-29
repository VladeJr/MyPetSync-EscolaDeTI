import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { Pet, PetSchema } from '../pets/schemas/pets.schema';
import { Provider, ProviderSchema } from '../providers/schemas/provider.schema';
import { ProvidersModule } from 'src/providers/providers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Pet.name, schema: PetSchema },
      { name: Provider.name, schema: ProviderSchema },
    ]),
    forwardRef(() => ProvidersModule), // quebra o ciclo de dependência entre providers e appointments
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
