import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

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
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @Req() req: any) {
    return this.service.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Avaliação removida' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.userId);
  }
}
