import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UploadModule } from './upload/upload.module';
import { EvaluateModule } from './evaluate/evaluate.module';
import { ResultModule } from './result/result.module';

@Module({
  imports: [CommonModule, UploadModule, EvaluateModule, ResultModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
