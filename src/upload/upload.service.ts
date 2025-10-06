import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { FileResponse } from '../model/upload.model';
import { promises as fs } from 'fs';
import { File } from '@prisma/client';

@Injectable()
export class UploadService {
  constructor(private prismaService: PrismaService) {}

  async saveFile(files: {
    cv: Express.Multer.File;
    project_report: Express.Multer.File;
  }): Promise<FileResponse> {
    const saveData = await this.prismaService.file.createManyAndReturn({
      data: [
        { name: files.cv.filename, path: files.cv.path, type: 'cv' },
        {
          name: files.project_report.filename,
          path: files.project_report.path,
          type: 'project_report',
        },
      ],
    });

    if (!saveData) {
      await Promise.allSettled([
        fs.unlink(files.cv.path),
        fs.unlink(files.project_report.path),
      ]);
      throw new HttpException('Failed to save data', 500);
    }

    const cvData = saveData.find((data) => data.type === 'cv');
    const projectData = saveData.find((data) => data.type === 'project_report');

    if (!cvData || !projectData) {
      await Promise.allSettled([
        fs.unlink(files.cv.path),
        fs.unlink(files.project_report.path),
      ]);
      throw new HttpException('Failed to save data', 500);
    }

    return {
      cv: {
        id: cvData.id,
        name: cvData.name,
      },
      project_report: {
        id: projectData.id,
        name: projectData.name,
      },
    };
  }
}
