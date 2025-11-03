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
  async getMe(@CurrentUser() user: { userId: string }): Promise<any> {
    const fullUser = await this.usersService.findByUserId(user.userId);

    // Retorna todos os campos que o front-end usa no Header e AuthContext
    return {
      id: fullUser._id,
      nome: fullUser.nome,
      email: fullUser.email,
      telefone: fullUser.telefone,
      // Inclua outros campos que seu front-end espera (como foto_perfil)
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
    // Usamos updateUserProfile que contém a lógica de validação de e-mail e nome
    const updated = await this.usersService.updateUserProfile(user.userId, dto);
    return updated as User;
  }
}
