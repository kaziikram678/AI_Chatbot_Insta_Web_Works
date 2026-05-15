import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.log('Current env:', { url: process.env.SUPABASE_URL ? 'SET' : 'MISSING', key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING' });
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  console.log('🔧 Setting up Supabase schema...');

  const sql = `
create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists documents_embedding_idx on documents 
using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
`;

  console.log('⚠️ Supabase REST API cannot run DDL directly.');
  console.log('Please copy and run this SQL in your Supabase Dashboard → SQL Editor:');
  console.log('--- START SQL ---');
  console.log(sql);
  console.log('--- END SQL ---');
  console.log('✅ Once run, type "done" and run: npm run ingest');
}

setupDatabase().catch(console.error);
