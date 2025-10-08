import { z } from 'zod';

export class EvaluateValidation {
  static readonly START_EVALUATE = z.object({
    job_title: z.string().min(1).max(100),
    cv_id: z.number().min(1).max(100).positive(),
    project_report_id: z.number().min(1).max(100).positive(),
  });
}
