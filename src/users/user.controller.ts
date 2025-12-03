import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';
import { User, UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Types } from 'mongoose';
import { TutorsService } from '../tutors/tutors.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tutorsService: TutorsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário logado.' })
  @ApiOkResponse({
    description:
      'Retorna o objeto User, com campos sensíveis omitidos por segurança.',
    type: User,
  })
  async getMe(@CurrentUser() user: { userId: string }): Promise<any> {
    const fullUser = await this.usersService.findByUserId(user.userId);
    if (!fullUser) {
      return null;
    }
    const userIdString = (
      fullUser as UserDocument & { _id: Types.ObjectId }
    )._id.toHexString();

    return {
      id: userIdString,
      nome: fullUser.nome,
      email: fullUser.email,
      telefone: fullUser.telefone,
      role: (fullUser as any).tipo_usuario,
      service: (fullUser as any).service || null,
    };
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Atualiza o perfil do usuário logado e do tutor associado',
  })
  async updateMe(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateUserDto,
  ): Promise<any> {
    const updatedUser = await this.usersService.updateUserProfile(
      user.userId,
      dto,
    );
    if (dto.nome) {
      try {
        await this.tutorsService.updateTutorByUserId(user.userId, {
          name: dto.nome,
        });
      } catch (error) {
        console.log('Tutor não encontrado para atualização:', error.message);
      }
    }

    return updatedUser;
  }
}
