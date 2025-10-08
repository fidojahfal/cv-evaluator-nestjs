import { ProcessorEvaluteResponse } from './processor.model';

export class ResultResponse {
  id: number;
  status: string;
  result?: ProcessorEvaluteResponse;
}
