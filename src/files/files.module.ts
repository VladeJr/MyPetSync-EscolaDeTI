import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileAsset, FileAssetSchema } from './schemas/file.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FileAsset.name, schema: FileAssetSchema }])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
