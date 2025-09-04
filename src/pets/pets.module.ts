import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { PetSchema } from './pet.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Pet', schema: PetSchema }])],
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}
