import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import type { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Custom Embeddings wrapper that calls Gemini SDK directly.
 * gemini-embedding-001 outputs 3072 dimensions.
 * The Pinecone index must be created with dimension=3072, metric=cosine.
 */
class GeminiEmbeddings extends Embeddings {
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor(apiKey: string) {
    super({});
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      const r = await this.model.embedContent(text.slice(0, 8000)); // Gemini token limit
      results.push(r.embedding.values);
    }
    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const r = await this.model.embedContent(text.slice(0, 8000));
    return r.embedding.values;
  }
}

function makeEmbeddings() {
  return new GeminiEmbeddings(process.env.GOOGLE_API_KEY!);
}

/**
 * Embeds chunked documents and stores them in Pinecone.
 * Each PDF gets its own namespace so questions are isolated per document.
 */
export async function embedAndStoreDocs(
  client: Pinecone,
  docs: Document[],
  namespace: string
) {
  try {
    const embeddings = makeEmbeddings();
    const index = client.Index(process.env.PINECONE_INDEX_NAME!);

    // Process in batches of 10 to avoid Gemini rate limits
    const batchSize = 10;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await PineconeStore.fromDocuments(batch, embeddings, {
        pineconeIndex: index,
        namespace,
        textKey: "text",
      });
      console.log(`  ↳ Embedded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docs.length / batchSize)}`);
    }

    console.log(`✅ Embedded ${docs.length} chunks into namespace "${namespace}"`);
  } catch (error) {
    console.error("embedAndStoreDocs error:", error);
    throw new Error("Failed to embed and store documents in Pinecone");
  }
}

/**
 * Returns a vector store retriever for a specific document namespace.
 */
export async function getVectorStore(client: Pinecone, namespace: string) {
  try {
    const embeddings = makeEmbeddings();
    const index = client.Index(process.env.PINECONE_INDEX_NAME!);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace,
      textKey: "text",
    });

    return vectorStore;
  } catch (error) {
    console.error("getVectorStore error:", error);
    throw new Error("Failed to load vector store from Pinecone");
  }
}