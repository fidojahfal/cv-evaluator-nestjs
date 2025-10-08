import { Module } from '@nestjs/common';
import { EvaluateService } from './evaluate.service';
import { EvaluateController } from './evaluate.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'evaluation',
      connection: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT!,
      },
    }),
  ],
  providers: [EvaluateService],
  controllers: [EvaluateController],
})
export class EvaluateModule {}
