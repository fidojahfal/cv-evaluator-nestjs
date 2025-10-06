import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [CommonModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
