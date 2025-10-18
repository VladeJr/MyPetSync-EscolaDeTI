import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
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
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
  async getMe(@CurrentUser() user: { userId: string }): Promise<User> {
    const fullUser = await this.usersService.findByUserId(user.userId);

    return fullUser as User;
  }

  @Put('me')
  @ApiOperation({
    summary:
      'Atualiza o perfil do usuário logado (exclui o hash da senha no retorno).',
  })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso.',
    type: User,
  })
  async updateUser(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(user.userId, dto);
  }
}
