import { NextRequest } from "next/server";
import { callChain } from "@/lib/langchain";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { question, chatHistory = "", namespace } = await req.json();

    if (!question?.trim()) {
      return new Response("Question is required", { status: 400 });
    }
    if (!namespace?.trim()) {
      return new Response("namespace (docId) is required", { status: 400 });
    }

    // callChain returns a ReadableStream<string>
    const stream = await callChain({ question, chatHistory, namespace });

    // Stream tokens directly to the client as plain text
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("chat route error:", err);
    return new Response("Failed to get AI response. Please try again.", {
      status: 500,
    });
  }
}
