import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { Vaccine, VaccineSchema } from './schemas/vaccine.schema';
import { VaccinesController } from './vaccine.controller';
import { VaccinesService } from './ vaccines.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vaccine.name, schema: VaccineSchema }]),
    UsersModule,
  ],
  controllers: [VaccinesController],
  providers: [VaccinesService],
  exports: [VaccinesService],
})
export class TutorsModule {}
