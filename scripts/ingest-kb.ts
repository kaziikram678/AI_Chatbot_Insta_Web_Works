import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { pipeline, env } from '@xenova/transformers';

config({ path: join(process.cwd(), '.env.local') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

env.allowLocalModels = false;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KB_DIR = join(process.cwd(), 'knowledge-base');
let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    console.log('📦 Loading local embedding model (first run downloads ~22MB)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

async function embedText(text: string) {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

function chunkText(text: string, chunkSize = 500, overlap = 100) {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }
  return chunks;
}

async function ingest() {
  console.log('📥 Starting KB ingestion...');
  const files = readdirSync(KB_DIR).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const content = readFileSync(join(KB_DIR, file), 'utf-8');
    const chunks = chunkText(content);
    const category = file.replace('.md', '');

    for (const chunk of chunks) {
      const embedding = await embedText(chunk);
      const { error } = await supabase.from('documents').insert({
        content: chunk,
        embedding,
        metadata: { source: category, last_updated: new Date().toISOString() }
      });
      if (error) console.error(`Error inserting ${file}:`, error);
    }
    console.log(`✅ Processed ${file} (${chunks.length} chunks)`);
  }
  console.log('🎉 Ingestion complete!');
}

ingest().catch(console.error);
