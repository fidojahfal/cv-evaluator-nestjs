import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UploadModule } from './upload/upload.module';
import { EvaluateModule } from './evaluate/evaluate.module';

@Module({
  imports: [CommonModule, UploadModule, EvaluateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
