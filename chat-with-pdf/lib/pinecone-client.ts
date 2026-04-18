import { Pinecone } from "@pinecone-database/pinecone";

let pineconeInstance: Pinecone | null = null;

/**
 * Returns a singleton Pinecone client.
 * Pinecone SDK v5+ only needs the API key — no environment needed.
 */
export async function getPineconeClient(): Promise<Pinecone> {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeInstance;
}