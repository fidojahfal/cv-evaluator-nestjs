import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';

export const UploadedFile = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      throw new HttpException('File is required!', 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new HttpException('Maximum file is 5mb!', 400);
    }

    const typesAllowed: string[] = ['application/pdf'];
    if (!typesAllowed.includes(file.mimetype)) {
      throw new HttpException('Only pdf files are allowed!', 400);
    }

    return file;
  },
);
