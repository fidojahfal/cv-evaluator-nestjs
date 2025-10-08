import 'dotenv/config';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

async function ingestDocs(): Promise<void> {
  const chromadb = new ChromaClient({
    host: process.env.CHROMA_DB_HOST,
    port: Number(process.env.CHROMA_DB_PORT) || 8000,
  });

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2',
  });

  const files = [
    { name: 'job_description', path: 'docs/Job_Description.pdf' },
    {
      name: 'case_study_brief',
      path: 'docs/Case_Study_Brief.pdf',
    },
    { name: 'scoring_rubric', path: 'docs/Scoring_Rubric.pdf' },
  ];

  const collection = await chromadb.getOrCreateCollection({
    name: 'ground_truth_docs',
  });

  for (const file of files) {
    const buffer = await fs.readFile(file.path);
    const text = (await pdf(buffer)).text;
    const embedding = await embeddings.embedQuery(text);

    await collection.add({
      ids: [file.name],
      embeddings: [embedding],
      metadatas: [{ name: file.name }],
    });
  }

  console.log('Ground truth docs successfully ingested');
}

ingestDocs();
