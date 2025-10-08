import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation/validation.service';
import { ErrorFilter } from './filter/error.filter';
import { APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.registerQueue({
      name: 'evaluation',
      connection: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT!,
      },
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
