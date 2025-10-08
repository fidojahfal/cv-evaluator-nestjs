import { Controller, Get, HttpCode, Param, ParseIntPipe } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultResponse } from '../model/result.model';

@Controller('/result')
export class ResultController {
  constructor(private resultService: ResultService) {}

  @Get('/:id')
  @HttpCode(200)
  async checkResult(
    @Param('id', ParseIntPipe) evaluation_id: number,
  ): Promise<ResultResponse> {
    return this.resultService.checkResult(evaluation_id);
  }
}
