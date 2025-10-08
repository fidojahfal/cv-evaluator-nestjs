import { OpenAIEmbeddings } from '@langchain/openai';
import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

async function ingestDocs(): Promise<void> {
  const chromadb = new ChromaClient({
    host: process.env.CHROMA_DB_HOST,
    port: +process.env.CHROMA_DB_PORT!,
  });

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPEN_API_KEY,
  });

  const files = [
    { name: 'job_description', path: '../../../docs/Job_Description.pdf' },
    {
      name: 'case_study_brief',
      path: '../../../docs/Case_Study Brief.pdf.pdf',
    },
    { name: 'scoring_rubric', path: '../../../docs/Scoring_Rubric.pdf.pdf' },
  ];

  const collection = await chromadb.createCollection({
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
