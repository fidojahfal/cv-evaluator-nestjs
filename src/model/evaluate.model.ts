export class StartEvaluateRequest {
  job_title: string;
  cv_id: number;
  project_report_id: number;
}

export class EvaluateResponse {
  id: number;
  status: string;
}
