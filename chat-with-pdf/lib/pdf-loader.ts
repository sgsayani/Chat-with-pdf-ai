import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";

/**
 * Loads a PDF from a Blob/Buffer (from browser upload) and returns
 * chunked Documents ready for embedding.
 */
export async function getChunkedDocsFromPDFBuffer(
  fileBuffer: ArrayBuffer
): Promise<Document[]> {
  try {
    const blob = new Blob([fileBuffer], { type: "application/pdf" });

    // WebPDFLoader works with Blob — safe for Next.js API routes
    const loader = new WebPDFLoader(blob, { parsedItemSeparator: " " });
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);
    console.log(`📄 Split PDF into ${chunkedDocs.length} chunks`);
    return chunkedDocs;
  } catch (e) {
    console.error("getChunkedDocsFromPDFBuffer error:", e);
    throw new Error("PDF chunking failed");
  }
}