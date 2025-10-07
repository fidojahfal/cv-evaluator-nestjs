import { Controller } from '@nestjs/common';
import { EvaluateService } from './evaluate.service';

@Controller()
export class EvaluateController {
  constructor(private evaluateService: EvaluateService) {}
}
