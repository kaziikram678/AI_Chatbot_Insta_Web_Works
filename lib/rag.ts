import { pipeline, env } from '@xenova/transformers';
import { supabase } from './supabase';

env.allowLocalModels = false;

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function embedText(text: string) {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function searchSimilarChunks(query: string, limit = 3) {
  const embedding = await embedText(query);
  
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit,
  });

  if (error) {
    console.error('Supabase search error:', error);
    return [];
  }

  return data || [];
}
