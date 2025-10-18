import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryProviderDto } from './dto/query-provider.dto';

import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('providers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria novo Prestador de Serviço' })
  @ApiOkResponse({ description: 'Prestador criado' })
  create(@Body() dto: CreateProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista paginada de prestadores' })
  @ApiOkResponse({ description: 'Lista paginada + filtros' })
  findAll(@Query() q: QueryProviderDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca prestador por ID' })
  @ApiOkResponse({ description: 'Prestador por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza prestador por ID' })
  @ApiOkResponse({ description: 'Prestador atualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove prestador por ID' })
  @ApiOkResponse({ description: 'Prestador removido' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
