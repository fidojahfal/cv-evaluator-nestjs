import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  EvaluateResponse,
  StartEvaluateRequest,
} from '../model/evaluate.model';
import { ValidationService } from '../common/validation/validation.service';
import { EvaluateValidation } from './evaluate.validation';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EvaluateService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @InjectQueue('evaluation') private queue: Queue,
  ) {}

  async startEvaluate(
    request: StartEvaluateRequest,
  ): Promise<EvaluateResponse> {
    const evaluateRequest: StartEvaluateRequest =
      this.validationService.validate(
        EvaluateValidation.START_EVALUATE,
        request,
      );

    const findDocument = await this.prismaService.file.findMany({
      where: {
        AND: [
          {
            AND: [{ id: evaluateRequest.cv_id }, { type: 'cv' }],
          },
          {
            AND: [
              { id: evaluateRequest.project_report_id },
              { type: 'project_report' },
            ],
          },
        ],
      },
    });

    const cv = findDocument.find((data) => data.type === 'cv');
    const project_report = findDocument.find(
      (data) => data.type === 'project_report',
    );

    if (!cv || !project_report) {
      throw new HttpException('Document not found!', 404);
    }

    const evaluation = await this.prismaService.evaluation.create({
      data: {
        job_title: evaluateRequest.job_title,
        cv_id: cv.id,
        report_id: project_report.id,
        status: 'queued',
      },
    });

    await this.queue.add('evaluate-cv', {
      evaluation_id: evaluation.id,
      cv,
      project_report,
    });

    return {
      id: evaluation.id,
      status: 'queued',
    };
  }
}
