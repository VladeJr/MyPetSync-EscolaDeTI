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
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { UpdateVaccineDto } from './dto/update-vaccine.dto';
import { QueryVaccineDto } from './dto/query-vaccine.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { VaccinesService } from './vaccines.service';

@ApiTags('vaccines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
/**
 * Controlador atende DOIS prefixos:
 *  - /vaccines
 *  - /pets/:petId/vaccines (rotas aninhadas)
 */
@Controller(['vaccines', 'pets/:petId/vaccines'])
export class VaccinesController {
  constructor(private readonly service: VaccinesService) {}

  /** Cria vacina global: body precisa de pet; se vier aninhado, usa pet do path */
  @Post()
  @ApiOkResponse({ description: 'Vacina criada' })
  create(@Body() dto: CreateVaccineDto, @Param('petId') petId?: string) {
    if (petId) {
      const { pet, ...payload } = dto;
      return this.service.createForPet(petId, payload);
    }
    return this.service.create(dto);
  }

  /** Lista com filtros/paginação; se vier aninhado, força pet */
  @Get()
  @ApiOkResponse({ description: 'Lista paginada + filtros' })
  findAll(@Query() q: QueryVaccineDto, @Param('petId') petId?: string) {
    return this.service.findAll(petId ? { ...q, pet: petId } : q);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Vacina por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Vacina atualizada' })
  update(@Param('id') id: string, @Body() dto: UpdateVaccineDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Vacina removida' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
