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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('services')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller(['services', 'providers/:providerId/services'])
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  /** Cria serviço global: body precisa de provider */
  @Post()
  @ApiOkResponse({ description: 'Serviço criado' })
  create(
    @Body() dto: CreateServiceDto,
    @Param('providerId') providerId?: string,
  ) {
    // se vier aninhado, sobrescreve provider pelo path param
    if (providerId) {
      const { provider, ...payload } = dto;
      return this.service.createForProvider(providerId, payload);
    }
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista paginada + filtros' })
  findAll(
    @Query() q: QueryServiceDto,
    @Param('providerId') providerId?: string,
  ) {
    return this.service.findAll(
      providerId ? { ...q, provider: providerId } : q,
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Serviço por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Serviço atualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Serviço removido' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
