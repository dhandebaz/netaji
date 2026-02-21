import { Pinecone } from '@pinecone-database/pinecone';

let client: Pinecone | null = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    return null;
  }
  client = new Pinecone({ apiKey });
  return client;
}

export const isPineconeAvailable = () => {
  const c = getClient();
  return !!c;
};

export async function searchKnowledgeBase(query: string, topK = 5) {
  const c = getClient();
  if (!c) {
    return [];
  }
  const indexName = process.env.PINECONE_INDEX || 'neta-knowledge';
  const index = c.index(indexName);
  const vector = new Array(1536).fill(0);
  vector[0] = query.length % 1;
  const res = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });
  return res.matches || [];
}
