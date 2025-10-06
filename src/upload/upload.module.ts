import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';

@Module({
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
