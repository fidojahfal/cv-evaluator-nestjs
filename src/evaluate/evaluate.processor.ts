/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HuggingFaceInference } from '@langchain/community/llms/hf';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ChromaClient } from 'chromadb';
import { JobRequestData } from '../model/processor.model';
import { promises as fs } from 'fs';
import pdf from 'pdf-parse';
import { PrismaService } from '../common/prisma/prisma.service';

@Processor('evaluation')
export class EvaluateProcessor extends WorkerHost {
  private chromadb = new ChromaClient({
    host: process.env.CHROMA_DB_HOST,
    port: +process.env.CHROMA_DB_PORT! || 8000,
  });
  private llm = new HuggingFaceInference({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    apiKey: process.env.HF_API_KEY,
    temperature: 0.3,
    maxTokens: 1024,
  });

  private embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2',
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

      const chromaCollection = await this.chromadb.createCollection({
        name: 'cv-evaluation',
      });

      await chromaCollection.add({
        ids: ['cv', 'project_report'],
        embeddings: [
          await this.embeddings.embedQuery(cvText),
          await this.embeddings.embedQuery(projectText),
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

      const collection = await this.chromadb.getOrCreateCollection({
        name: 'ground_truth_docs',
      });

      const groundTruth = await collection.get({
        ids: ['job_description', 'case_study_brief', 'scoring_rubric'],
      });

      const jobDescriptionText =
        groundTruth.documents?.[0]?.[0] || 'No job description found!';
      const caseStudyBriefText =
        groundTruth.documents?.[1]?.[0] || 'No job description found!';
      const scoringRubricText =
        groundTruth.documents?.[2]?.[0] || 'No job description found!';

      const cvPrompt = `You are an AI evaluator comparing a candidate's CV against a job description and a scoring rubric.

--- Job Description ---
${jobDescriptionText.slice(0, 4000)}

--- CV Scoring Rubric ---
${scoringRubricText.slice(0, 4000)}

--- Candidate CV ---
${cvText.slice(0, 4000)}

Respond ONLY in strict JSON format:
{
  "cv_match_rate": number (0.0 - 1.0),
  "cv_feedback": string
}
      `;

      const cvResponse = await this.llm.invoke(cvPrompt);

      let cvResult;
      try {
        cvResult = JSON.parse(cvResponse);
      } catch {
        cvResult = {
          cv_match_rate: 0,
          cv_feedback: 'Failed to parse CV evaluation response.',
        };
      }

      const projectPrompt = `You are an AI evaluator reviewing a candidate's project report relative to the official case study and scoring rubric.

--- Case Study Brief ---
${caseStudyBriefText.slice(0, 4000)}

--- Project Scoring Rubric ---
${scoringRubricText.slice(0, 4000)}

--- Candidate Project Report ---
${projectText.slice(0, 4000)}

Respond ONLY in strict JSON format:
{
  "project_score": number (0.0 - 5.0),
  "project_feedback": string
}
  `;

      const projectResponse = await this.llm.invoke(projectPrompt);

      let projectResult;
      try {
        projectResult = JSON.parse(projectResponse);
      } catch {
        projectResult = {
          project_score: 0,
          project_feedback: 'Failed to parse project evaluation response.',
        };
      }

      const finalPrompt = `
You are a senior AI recruiter summarizing the candidate's readiness for the backend engineer role.

Combine both evaluations:

CV Evaluation:
${JSON.stringify(cvResult)}

Project Evaluation:
${JSON.stringify(projectResult)}

Respond in JSON:
{
  "overall_summary": string
}
Be concise (under 5 sentences).
      `;

      const finalResponse = await this.llm.invoke(finalPrompt);

      let finalSummary;
      try {
        finalSummary = JSON.parse(finalResponse);
      } catch {
        finalSummary = {
          overal_summary: 'Evaluation summary failed to parse.',
        };
      }

      const evaluationResult = {
        cv_match_rate: cvResult.cv_match_rate,
        cv_feedback: cvResult.cv_feedback,
        project_score: projectResult.project_score,
        project_feedback: projectResult.project_feedback,
        overall_summary: finalSummary.overall_summary,
      };

      await this.prismaService.evaluation.update({
        where: {
          id: evaluation_id,
        },
        data: {
          status: 'completed',
          result: evaluationResult,
        },
      });

      return evaluationResult;
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
