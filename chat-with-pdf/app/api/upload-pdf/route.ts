import { NextRequest, NextResponse } from "next/server";
import { getChunkedDocsFromPDFBuffer } from "@/lib/pdf-loader";
import { embedAndStoreDocs } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60; // allow up to 60s for large PDFs

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Unique namespace per document — keeps vectors isolated in Pinecone
    const docId = randomUUID();

    console.log(`📥 Uploading "${file.name}" (${file.size} bytes) → namespace: ${docId}`);

    // Read file → chunks → embed → store
    const buffer = await file.arrayBuffer();
    const chunks = await getChunkedDocsFromPDFBuffer(buffer);

    const pinecone = await getPineconeClient();
    await embedAndStoreDocs(pinecone, chunks, docId);

    // Return metadata the UI will store to identify this doc
    return NextResponse.json({
      docId,
      name: file.name.replace(/\.pdf$/i, ""),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      pages: estimatePages(chunks),
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  } catch (err) {
    console.error("upload-pdf error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF. Please try again." },
      { status: 500 }
    );
  }
}

/** Rough estimate: most PDF pages produce 1–4 chunks at 1000 chars */
function estimatePages(chunks: { pageContent: string }[]): number {
  const unique = new Set(
    chunks.map((c) => (c as { metadata?: { loc?: { pageNumber?: number } } }).metadata?.loc?.pageNumber ?? 0)
  );
  return unique.size > 1 ? unique.size : Math.max(1, Math.ceil(chunks.length / 3));
}
