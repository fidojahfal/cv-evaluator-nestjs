import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ResultResponse } from '../model/result.model';
import { ProcessorEvaluteResponse } from '../model/processor.model';

@Injectable()
export class ResultService {
  constructor(private prismaService: PrismaService) {}
  async checkResult(evaluation_id: number): Promise<ResultResponse> {
    const findEvaluation = await this.prismaService.evaluation.findFirst({
      where: {
        id: evaluation_id,
      },
    });

    if (!findEvaluation) {
      throw new HttpException('Evaluation not found!', 404);
    }

    if (
      findEvaluation.status !== 'queued' &&
      findEvaluation.status !== 'processing'
    ) {
      return {
        id: findEvaluation.id,
        status: findEvaluation.status,
        result: findEvaluation.result
          ? (findEvaluation.result as unknown as ProcessorEvaluteResponse)
          : undefined,
      };
    }

    return {
      id: findEvaluation.id,
      status: findEvaluation.status,
    };
  }
}
