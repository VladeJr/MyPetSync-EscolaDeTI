import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'node:path';
import * as fs from 'fs';
import express from 'express';
import { UploadFileDto } from './dto/upload-file.dto';

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        kind: { type: 'string', enum: ['exam','prescription'] },
        ownerId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, 'uploads'),
      filename: (_req, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`)
    }),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      cb(null, ALLOWED.includes(file.mimetype));
    },
  }))
  async upload(@UploadedFile() file: any, @Body() body: UploadFileDto) {
    if (!file) return { ok: false, message: 'Arquivo inválido. Tipos permitidos: PDF/PNG/JPG/WEBP, até 15MB.' };
    this.service.ensureDir();
    const saved = await this.service.saveMeta(file, body.kind, body.ownerId);
    return { ok: true, file: saved };
  }

  @Get(':id/stream')
  @HttpCode(HttpStatus.OK)
  async stream(@Param('id') id: string, @Res({ passthrough: true }) res: express.Response) {
    const { file, filePath } = await this.service.getStreamInfo(id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size.toString());
    return new StreamableFile(fs.createReadStream(filePath));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
