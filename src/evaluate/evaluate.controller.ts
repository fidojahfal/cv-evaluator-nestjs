import { Body, Controller, ParseIntPipe } from '@nestjs/common';
import { EvaluateService } from './evaluate.service';
import {
  EvaluateResponse,
  StartEvaluateRequest,
} from '../model/evaluate.model';

@Controller('/evaluate')
export class EvaluateController {
  constructor(private evaluateService: EvaluateService) {}

  async startEvaluate(
    @Body('job_title') job_title: string,
    @Body('cv_id', ParseIntPipe) cv_id: number,
    @Body('project_report_id', ParseIntPipe) project_report_id: number,
  ): Promise<EvaluateResponse> {
    const request: StartEvaluateRequest = {
      job_title,
      cv_id,
      project_report_id,
    };

    return this.evaluateService.startEvaluate(request);
  }
}
