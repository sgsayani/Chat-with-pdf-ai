import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// gemini-2.5-flash-lite — confirmed working on the free tier for this API key
// (gemini-2.0-flash and gemini-2.0-flash-lite both have quota=0 for this key)
const GEMINI_MODEL = "gemini-2.5-flash-lite";

let _streamingModel: ChatGoogleGenerativeAI | null = null;
let _nonStreamingModel: ChatGoogleGenerativeAI | null = null;

/** Streaming model — used for final answer generation */
export function getStreamingModel(): ChatGoogleGenerativeAI {
  if (!_streamingModel) {
    _streamingModel = new ChatGoogleGenerativeAI({
      model: GEMINI_MODEL,
      streaming: true,
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY!,
      maxRetries: 2,
    });
  }
  return _streamingModel;
}

/** Non-streaming model — used for condensing follow-up questions into a standalone question */
export function getNonStreamingModel(): ChatGoogleGenerativeAI {
  if (!_nonStreamingModel) {
    _nonStreamingModel = new ChatGoogleGenerativeAI({
      model: GEMINI_MODEL,
      streaming: false,
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY!,
      maxRetries: 2,
    });
  }
  return _nonStreamingModel;
}
