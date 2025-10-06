import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';

export const UploadedFilesValidated = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const files = request.files;

    if (!files || !files.cv || !files.project_report) {
      throw new HttpException('Cv or project report cannot be blank!', 400);
    }

    const validateFile = (file: Express.Multer.File) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new HttpException('Maximum file is 5mb!', 400);
      }

      const typesAllowed: string[] = ['application/pdf'];
      if (!typesAllowed.includes(file.mimetype)) {
        throw new HttpException('Only pdf files are allowed!', 400);
      }

      return file;
    };

    return {
      cv: validateFile(files.cv[0]),
      project_report: validateFile(files.project_report[0]),
    };
  },
);
