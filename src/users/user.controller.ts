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

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário logado.' })
  @ApiOkResponse({
    description:
      'Retorna o objeto User, com campos sensíveis omitidos por segurança.',
    type: User,
  })
  async getMe(@CurrentUser() user: { userId: string }): Promise<any> {
    const fullUser = await this.usersService.findByUserId(user.userId);
    const userIdString = (
      fullUser as UserDocument & { _id: Types.ObjectId }
    )._id.toHexString();

    return {
      id: userIdString,
      nome: fullUser.nome,
      email: fullUser.email,
      telefone: fullUser.telefone,
    };
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Atualiza o perfil do usuário logado (exclui o hash da senha...',
  })
  async updateMe(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    const updated = await this.usersService.updateUserProfile(user.userId, dto);
    return updated as User;
  }
}
