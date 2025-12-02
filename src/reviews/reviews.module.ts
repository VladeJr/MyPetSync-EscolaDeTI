import { forwardRef, Module } from '@nestjs/common'; // ✅ Adicione forwardRef aqui
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review, ReviewSchema } from './schemas/review.schema';
import { UsersModule } from '../users/users.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ProvidersModule } from 'src/providers/providers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    forwardRef(() => ProvidersModule), // ✅ CORRIGIDO: Era o índice [1] que causou o erro.
    UsersModule,
    forwardRef(() => AppointmentsModule), // ✅ CORRIGIDO: Necessário por causa da injeção no AppointmentsModule.
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule { }