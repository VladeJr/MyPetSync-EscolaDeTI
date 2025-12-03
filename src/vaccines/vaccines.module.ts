import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { Vaccine, VaccineSchema } from './schemas/vaccine.schema';
import { VaccinesController } from './vaccine.controller';
import { VaccinesService } from './vaccines.service';
import { PetsModule } from 'src/pets/pets.module';
import { Pet, PetSchema } from 'src/pets/schemas/pets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vaccine.name, schema: VaccineSchema },
      { name: Pet.name, schema: PetSchema }]),
    UsersModule,
    PetsModule
  ],
  controllers: [VaccinesController],
  providers: [VaccinesService],
  exports: [VaccinesService],
})
export class VaccinesModule {}
