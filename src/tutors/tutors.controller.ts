import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/shared/current-user.decorator';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('tutors')
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo perfil de tutor' })
  async create(
    @CurrentUser() user: { userId: string; name: string },
    @Body() dto: CreateTutorDto,
  ) {
    return this.tutorsService.createForUser(user.userId, user.name, dto);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna o perfil do tutor logado' })
  @ApiOkResponse({ description: 'Retorna o perfil do tutor.' })
  async getMine(@CurrentUser() user: { userId: string }) {
    return this.tutorsService.getByUserId(user.userId);
  }

  @Put('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza o perfil do tutor logado' })
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso.' })
  async updateMine(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateTutorDto,
  ) {
    return this.tutorsService.updateMine(user.userId, dto);
  }

  @Delete('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove o perfil do tutor logado' })
  @ApiOkResponse({ description: 'Perfil removido com sucesso.' })
  async removeMine(@CurrentUser() user: { userId: string }) {
    return this.tutorsService.removeMine(user.userId);
  }

 @Get()
  @ApiOperation({ summary: 'Lista todos os tutores (apenas para Admin)' })
  @ApiOkResponse({ description: 'Retorna a lista de tutores.' })
  async listAll(@Query('limit') limit: number, @Query('page') page: number) {
    return this.tutorsService.listAll(limit, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um tutor pelo ID (apenas para Admin)' })
  @ApiOkResponse({ description: 'Retorna um tutor específico.' })
  async getTutorById(@Param('id') id: string) {
    return this.tutorsService.findById(id);
  }

  @Get('mine/addresses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista todos os endereços do tutor logado' })
  async listAddresses(@CurrentUser() user: { userId: string }) {
    return this.tutorsService.listAddresses(user.userId);
  }

  @Post('mine/addresses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adiciona um novo endereço ao tutor logado' })
  async addAddress(
    @CurrentUser() user: { userId: string },
    @Body() addressDto: any,
  ) {
    return this.tutorsService.addAddress(user.userId, addressDto);
  }

  @Delete('mine/addresses/:addressId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove um endereço do tutor logado' })
  async deleteAddress(
    @CurrentUser() user: { userId: string },
    @Param('addressId') addressId: string,
  ) {
    return this.tutorsService.deleteAddress(user.userId, addressId);
  }

  @Put('mine/addresses/:addressId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza um endereço do tutor logado' })
  async updateAddress(
    @CurrentUser() user: { userId: string },
    @Param('addressId') addressId: string,
    @Body() addressDto: UpdateAddressDto,
  ) {
    return this.tutorsService.updateAddress(user.userId, addressId, addressDto);
  }
}