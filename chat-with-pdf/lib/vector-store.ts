import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import type { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import { GoogleGenerativeAI } from "@google/generative-ai";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Gemini's 429 payload nests a retryDelay (e.g. "23s") inside RetryInfo. */
function retryDelayMs(error: unknown): number | null {
  const details = (error as { errorDetails?: Array<Record<string, unknown>> })
    ?.errorDetails;
  const retryInfo = details?.find(
    (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
  );
  const raw = retryInfo?.retryDelay;
  if (typeof raw !== "string") return null;
  const seconds = parseFloat(raw);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

function isRateLimitError(error: unknown): boolean {
  return (error as { status?: number })?.status === 429;
}

function isTimeoutError(error: unknown): boolean {
  return (error as { name?: string })?.name === "GoogleGenerativeAIAbortError";
}

/**
 * Custom Embeddings wrapper that calls Gemini SDK directly.
 * gemini-embedding-001 outputs 3072 dimensions.
 * The Pinecone index must be created with dimension=3072, metric=cosine.
 *
 * Free-tier embedding quota is a tight per-minute limit, not just a daily
 * cap — a multi-hundred-chunk PDF firing sequential requests trips it
 * mid-document. Retry with backoff instead of failing the whole upload.
 */
class GeminiEmbeddings extends Embeddings {
  private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

  constructor(apiKey: string) {
    super({});
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  }

  private async embedWithRetry(text: string, maxRetries = 2): Promise<number[]> {
    for (let attempt = 0; ; attempt++) {
      try {
        // Vercel functions get killed hard at maxDuration with no error of
        // ours to catch — a per-call timeout turns a silent hang (observed
        // in prod: request never resolves/rejects) into a retryable error.
        // Kept tight (12s * 3 attempts + backoff ≈ 39s worst case) to stay
        // inside the route's 60s maxDuration for the whole document.
        const r = await this.model.embedContent(text.slice(0, 8000), {
          timeout: 12_000,
        }); // Gemini token limit
        return r.embedding.values;
      } catch (error) {
        const rateLimited = isRateLimitError(error);
        if ((!rateLimited && !isTimeoutError(error)) || attempt >= maxRetries) {
          throw error;
        }
        const delay = (rateLimited ? retryDelayMs(error) : null) ?? 2 ** attempt * 1000;
        console.warn(
          `  ⏳ Gemini embedding ${rateLimited ? "rate-limited" : "timed out"}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries})`
        );
        await sleep(delay);
      }
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embedWithRetry(text));
    }
    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embedWithRetry(text);
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