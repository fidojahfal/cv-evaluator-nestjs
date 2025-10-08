import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ChromaClient } from 'chromadb';
import { PrismaService } from '../prisma/prisma.service';
import { EvaluteResponse, JobRequestData } from '../../model/processor.model';
import { promises as fs } from 'fs';

@Processor('evaluation')
export class EvaluateProcessor extends WorkerHost {
  private chromadb = new ChromaClient({
    host: process.env.CHROMA_DB_HOST,
    port: +process.env.CHROMA_DB_PORT!,
  });
  private llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    apiKey: process.env.OPEN_API_KEY,
    temperature: 0.2,
  });

  constructor(private prismaService: PrismaService) {
    super();
  }

  async process(job) {
    const { evaluation_id, cv, project_report }: JobRequestData = job.data;

    try {
      await this.prismaService.evaluation.update({
        where: {
          id: evaluation_id,
        },
        data: {
          status: 'processing',
        },
      });

      const cvText = (await pdf(await fs.readFile(cv.path))).text;
      const projectText = (await pdf(await fs.readFile(project_report.path)))
        .text;

      const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPEN_API_KEY,
      });

      const chromaCollection = await this.chromadb.createCollection({
        name: 'cv-evaluation',
      });

      await chromaCollection.add({
        ids: ['cv', 'project_report'],
        embeddings: [
          await embeddings.embedQuery(cvText),
          await embeddings.embedQuery(projectText),
        ],
        metadatas: [
          {
            type: 'cv',
            filename: cv.name,
          },
          {
            type: 'project_report',
            filename: project_report.name,
          },
        ],
      });

      const promptAi = `You are an AI evaluation assistant. Analyze the candidate's CV and project report below.
Respond strictly in JSON format as shown.

--- CV ---
${cvText.slice(0, 4000)}

--- PROJECT REPORT ---
${projectText.slice(0, 4000)}

Respond in JSON format:
{
  "cv_match_rate": number (0.0 - 1.0),
  "cv_feedback": string,
  "project_score": number (0.0 - 5.0),
  "project_feedback": string,
  "overall_summary": string
}
`;

      const response = await this.llm.invoke([
        { role: 'user', content: promptAi },
      ]);

      let parsed: EvaluteResponse;
      try {
        parsed = JSON.parse(response.content);
      } catch (e) {
        parsed = {
          cv_match_rate: 0,
          cv_feedback: `Failed to parse AI output`,
          project_score: 0,
          project_feedback: `Invalid format`,
          overall_summary: `Error occured during evaluation.`,
        };
      }

      const evaluation = await this.prismaService.evaluation.update({
        where: {
          id: evaluation_id,
        },
        data: {
          status: 'completed',
          result: parsed,
        },
      });

      return evaluation;
    } catch (error) {
      await this.prismaService.evaluation.update({
        where: {
          id: evaluation_id,
        },
        data: {
          status: 'failed',
          result: { error: error.message },
        },
      });

      console.error(`Evaluation failed for id: ${evaluation_id}`);
      throw error;
    }
  }
}
