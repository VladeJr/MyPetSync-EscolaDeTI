import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ProvidersService } from '../providers/providers.service';
import { CurrentUser } from 'src/shared/current-user.decorator';
import { Types } from 'mongoose';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly service: ReviewsService,
    private readonly providersService: ProvidersService,
  ) {}

  @Get('stats/average')
  @ApiOkResponse({
    description:
      'Retorna a avaliação média e contagem de avaliações para o Provider logado',
  })
  async getAverageRatingByProvider(@CurrentUser() user: { userId: string }) {
    const provider = await this.providersService.findOneByUserId(user.userId);
    if (!provider) return { average: 0.0, count: 0 };

    return this.service.getAverageRatingByProvider(
      (provider._id as Types.ObjectId).toString(),
    );
  }

  @Get('recent')
  @ApiOkResponse({
    description:
      'Lista as últimas avaliações para o dashboard do Provider logado',
  })
  async findRecentByProvider(@CurrentUser() user: { userId: string }) {
    const provider = await this.providersService.findOneByUserId(user.userId);
    if (!provider) return [];

    return this.service.findRecentByProvider(
      (provider._id as Types.ObjectId).toString(),
    );
  }

  @Post()
  @ApiOkResponse({ description: 'Avaliação criada' })
  create(@Body() dto: CreateReviewDto, @Req() req: any) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de avaliações' })
  findAll(@Query() q: QueryReviewDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Avaliação por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Avaliação atualizada' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: any,
  ) {
    return this.service.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Avaliação removida' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.userId);
  }
}
