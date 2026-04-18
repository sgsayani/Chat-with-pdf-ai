import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
// import { getStreamingModel, getNonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-template";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import type { Document } from "@langchain/core/documents";
import { getNonStreamingModel, getStreamingModel } from "./llm";

type CallChainArgs = {
    question: string;
    chatHistory: string;
    namespace: string;
};

/** Format retrieved docs into a single context string */
function formatDocumentsAsString(docs: Document[]): string {
    return docs.map((d) => d.pageContent).join("\n\n");
}

/**
 * Builds and runs a Retrieval-Augmented Generation (RAG) pipeline using LCEL.
 * Returns a ReadableStream<string> that streams tokens to the caller.
 */
export async function callChain({
    question,
    chatHistory,
    namespace,
}: CallChainArgs): Promise<ReadableStream<string>> {
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");

    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient, namespace);
    const retriever = vectorStore.asRetriever(4);

    // Step 1: Condense follow-up question into a standalone question
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
        STANDALONE_QUESTION_TEMPLATE
    );

    const standaloneQuestionChain = RunnableSequence.from([
        standaloneQuestionPrompt,
        getNonStreamingModel(),
        new StringOutputParser(),
    ]);

    // Step 2: Retrieve context and answer the question
    const qaPrompt = PromptTemplate.fromTemplate(QA_TEMPLATE);

    const retrievalChain = RunnableSequence.from([
        {
            // Generate a standalone question from the history + current question
            standalone_question: standaloneQuestionChain,
            original_input: new RunnablePassthrough(),
        },
        {
            // Use the standalone question to retrieve relevant docs
            context: async (input: { standalone_question: string }) => {
                const docs = await retriever.invoke(input.standalone_question);
                return formatDocumentsAsString(docs);
            },
            question: (input: { original_input: { question: string } }) =>
                input.original_input.question,
        },
        qaPrompt,
        getStreamingModel(),
        new StringOutputParser(),
    ]);

    // Build a native ReadableStream that pipes tokens to the caller
    const transformStream = new TransformStream<string, string>();
    const writer = transformStream.writable.getWriter();

    retrievalChain
        .stream(
            { question: sanitizedQuestion, chat_history: chatHistory },
            {
                callbacks: [
                    {
                        handleLLMNewToken: async (token: string) => {
                            try {
                                await writer.write(token);
                            } catch {
                                // writer may already be closed
                            }
                        },
                    },
                ],
            }
        )
        .then(async (stream) => {
            // The stream here is the full AsyncGenerator of chunks
            for await (const chunk of stream) {
                try {
                    await writer.write(typeof chunk === "string" ? chunk : String(chunk));
                } catch {
                    break;
                }
            }
            await writer.close();
        })
        .catch(async (err) => {
            console.error("RAG chain error:", err);
            try {
                // Write a readable error into the stream so client never gets ERR_EMPTY_RESPONSE
                const isQuota = err?.message?.includes("429") || err?.message?.includes("quota");
                const isNotFound = err?.message?.includes("404") || err?.message?.includes("not found");
                const msg = isQuota
                    ? "⚠️ **AI quota temporarily exceeded.** The free-tier rate limit has been reached. Please wait a few minutes and try again, or check your Google AI Studio usage."
                    : isNotFound
                    ? "⚠️ **Model not found.** Check that your GOOGLE_API_KEY is a valid Google AI Studio key."
                    : `⚠️ **Error generating response:** ${err?.message?.slice(0, 200) ?? "Unknown error"}`;
                await writer.write(msg);
                await writer.close();
            } catch { }
        });

    return transformStream.readable;
}