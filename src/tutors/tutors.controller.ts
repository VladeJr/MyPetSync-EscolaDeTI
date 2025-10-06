import { Body, Controller, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from '../shared/jwt-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';

@ApiTags('tutors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutors: TutorsService) {}

  @Post('me')
  async createMe(@CurrentUser() u: any, @Body() dto: CreateTutorDto) {
    return this.tutors.createForUser(u.sub, dto);
  }

  @Get('me')
  async getMe(@CurrentUser() u: any) {
    return this.tutors.getByUserId(u.sub);
  }

  @Put('me')
  async updateMe(@CurrentUser() u: any, @Body() dto: UpdateTutorDto) {
    return this.tutors.updateMine(u.sub, dto);
  }

  @Delete('me')
  async removeMe(@CurrentUser() u: any) {
    return this.tutors.removeMine(u.sub);
  }
}
