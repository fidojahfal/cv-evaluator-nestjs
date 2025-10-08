import 'dotenv/config';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

export async function ingestDocs(): Promise<void> {
  const chromadb = new ChromaClient({
    host: process.env.CHROMA_DB_HOST,
    port: Number(process.env.CHROMA_DB_PORT) || 8000,
  });

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: 'sentence-transformers/all-MiniLM-L6-v2',
  });

  try {
    await chromadb.deleteCollection({ name: 'ground_truth_docs' });
  } catch (error) {
    console.log('Old collection not found, proceeding to create a new one.');
  }

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

  const ids: string[] = [];
  const documentTexts: string[] = [];
  const documentEmbeddings: number[][] = [];
  const metadatas: { [key: string]: any }[] = [];

  for (const file of files) {
    const buffer = await fs.readFile(file.path);
    const text = (await pdf(buffer)).text;
    const embedding = await embeddings.embedQuery(text);

    ids.push(file.name);
    documentTexts.push(text);
    metadatas.push({ name: file.name });
    documentEmbeddings.push(embedding);
  }

  await collection.add({
    ids,
    documents: documentTexts,
    metadatas,
    embeddings: documentEmbeddings,
  });

  console.log('Ground truth docs successfully ingested');
}

ingestDocs();
