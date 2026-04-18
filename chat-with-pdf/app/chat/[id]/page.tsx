"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import {
  mockDocuments,
  mockMessages,
  type ChatMessage,
  type PDFDocument,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────
// Markdown renderer (handles bold, bullets, numbered lists)
// ────────────────────────────────────────────────────────────
function renderLine(line: string, key: number) {
  const parts = line.split(/\*\*(.*?)\*\*/g);
  const content = parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i}>{p}</strong> : p
  );

  const bullet = line.trim().startsWith("- ");
  const numbered = /^\d+\.\s/.test(line.trim());

  if (bullet) return <li key={key} className="ml-4 list-disc leading-relaxed">{renderBold(line.trim().slice(2))}</li>;
  if (numbered) return <li key={key} className="ml-4 list-decimal leading-relaxed">{renderBold(line.trim().replace(/^\d+\.\s/, ""))}</li>;
  if (!line.trim()) return <div key={key} className="h-2" />;
  return <p key={key} className="leading-relaxed">{content}</p>;
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p));
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return <div className="space-y-1 text-sm">{lines.map(renderLine)}</div>;
}

// ────────────────────────────────────────────────────────────
// PDF Viewer (simulated)
// ────────────────────────────────────────────────────────────
function PDFViewer({ doc }: { doc: PDFDocument }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const skeletonWidths = [
    "w-full", "w-5/6", "w-full", "w-4/5", "w-full",
    "w-3/4", "w-full", "w-5/6", "w-full", "w-2/3",
    "w-full", "w-4/5", "w-5/6", "w-full", "w-3/4",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Viewer toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5 bg-background shrink-0">
        <div className="flex items-center gap-1">
          <Button
            id="pdf-prev-page"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-xs text-muted-foreground">
            {currentPage} / {doc.pages}
          </span>
          <Button
            id="pdf-next-page"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentPage((p) => Math.min(doc.pages, p + 1))}
            disabled={currentPage === doc.pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            id="pdf-zoom-out"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
          <Button
            id="pdf-zoom-in"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button id="pdf-download" variant="ghost" size="icon" className="h-7 w-7">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* PDF page area */}
      <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-950 p-4">
        <div
          className="mx-auto bg-white dark:bg-zinc-900 shadow-lg rounded-sm transition-all duration-200"
          style={{
            width: `${zoom}%`,
            maxWidth: "640px",
            minWidth: "280px",
            aspectRatio: "8.5 / 11",
            padding: "32px",
          }}
        >
          {currentPage === 1 ? (
            /* First page: show realistic content */
            <div className="h-full flex flex-col gap-4">
              <div className="text-center border-b border-gray-200 dark:border-zinc-700 pb-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                  PDF DOCUMENT
                </p>
                <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100 leading-tight">
                  {doc.name}
                </h2>
                <p className="text-[10px] text-gray-500 mt-1">
                  {doc.pages} pages · {doc.size}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-1.5">
                    Abstract
                  </p>
                  <p className="text-[9px] leading-relaxed text-gray-700 dark:text-zinc-300">
                    {doc.summary}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                    1. Introduction
                  </p>
                  <div className="space-y-1.5">
                    {skeletonWidths.slice(0, 8).map((w, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700",
                          w
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                    2. Methodology
                  </p>
                  <div className="space-y-1.5">
                    {skeletonWidths.slice(8).map((w, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700",
                          w
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Other pages: full skeleton */
            <div className="h-full flex flex-col gap-4">
              <div className="mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:text-zinc-400 mb-2">
                  {currentPage % 3 === 0
                    ? `${currentPage}. Results`
                    : currentPage % 3 === 1
                    ? `${currentPage}. Discussion`
                    : `${currentPage}. Analysis`}
                </p>
                <div className="space-y-1.5">
                  {[...skeletonWidths, ...skeletonWidths.slice(0, 8)].map(
                    (w, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700",
                          w
                        )}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Suggested questions
// ────────────────────────────────────────────────────────────
const suggestions = [
  "Summarize this document",
  "What are the key findings?",
  "List the main conclusions",
  "What methodology was used?",
];

// ────────────────────────────────────────────────────────────
// Chat Panel
// ────────────────────────────────────────────────────────────
function ChatPanel({ doc }: { doc: PDFDocument }) {
  const initialMessages = mockMessages[doc.id] ?? [
    {
      id: "m1",
      role: "assistant" as const,
      content: `📄 I've analyzed **${doc.name}** (${doc.pages} pages). Ask me anything about this document!`,
      timestamp: "Now",
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(
    (text?: string) => {
      const content = (text ?? input).trim();
      if (!content) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "I'm analyzing your question against the document content. This is a **static demo** — once connected to the LangChain + Pinecone backend, I'll provide accurate, citation-backed answers from your PDF.\n\nFeel free to ask more questions!",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, aiMsg]);
      }, 1500);
    },
    [input]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 shrink-0 bg-background">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span className="font-semibold text-sm">AI Assistant</span>
          <Badge className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 rounded-full">
            Online
          </Badge>
        </div>
        <Button
          id="chat-reset-btn"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMessages(initialMessages)}
          title="Reset chat"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2.5",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            {msg.role === "assistant" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            )}

            <div
              className={cn(
                "flex max-w-[80%] flex-col gap-1",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5",
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}
              >
                <MessageContent content={msg.content} />
              </div>
              <span className="px-1 text-[10px] text-muted-foreground">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions (show only at start) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              id={`suggestion-${s.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => handleSend(s)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400/30 transition-all">
          <Textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this document… (Enter to send)"
            className="flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 min-h-[36px] max-h-[140px]"
            rows={1}
          />
          <Button
            id="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={cn(
              "h-8 w-8 shrink-0 rounded-lg p-0 transition-all",
              input.trim()
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          AI responses are generated from your PDF content via LangChain + Pinecone
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Chat Page
// ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const doc: PDFDocument | undefined = mockDocuments.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold">Document not found</p>
        <Button onClick={() => router.push("/")} variant="outline">
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Chat Navbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 bg-background/95 backdrop-blur z-40">
        <Link
          href="/"
          id="chat-back-btn"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
            <FileText className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <span className="truncate text-sm font-semibold text-foreground max-w-xs">
            {doc.name}
          </span>
          <Badge className="hidden sm:inline-flex text-[10px] px-1.5 py-0 shrink-0 bg-muted text-muted-foreground border-border rounded-full">
            {doc.pages} pages
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button id="chat-share-btn" variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <ModeToggle />
        </div>
      </header>

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: PDF Viewer */}
        <div className="hidden md:flex w-[42%] shrink-0 flex-col border-r border-border overflow-hidden">
          <PDFViewer doc={doc} />
        </div>

        {/* Right: Chat */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatPanel doc={doc} />
        </div>
      </div>
    </div>
  );
}
