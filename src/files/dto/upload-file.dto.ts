import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({ enum: ['exam','prescription'] })
  @IsOptional() @IsString()
  kind?: 'exam' | 'prescription';

  @ApiPropertyOptional({ description: 'Id do registro dono (examId/prescriptionId)' })
  @IsOptional() @IsMongoId()
  ownerId?: string;
}
