import { Controller, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadedFilesValidated } from '../common/decorator/file.decorator';
import { UploadService } from './upload.service';
import { FileResponse } from '../model/upload.model';

@Controller('/upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}
  @Post()
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'project_report', maxCount: 1 },
    ]),
  )
  async saveFile(
    @UploadedFilesValidated()
    files: {
      cv: Express.Multer.File;
      project_report: Express.Multer.File;
    },
  ): Promise<FileResponse> {
    return this.uploadService.saveFile(files);
  }
}
