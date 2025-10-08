import { File } from '@prisma/client';

export class JobRequestData {
  evaluation_id: number;
  cv: File;
  project_report: File;
}

export class EvaluteResponse {
  cv_match_rate: number;
  cv_feedback: string;
  project_score: number;
  project_feedback: string;
  overall_summary: string;
}
