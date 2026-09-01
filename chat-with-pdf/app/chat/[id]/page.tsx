"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDocuments } from "@/hooks/use-documents";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  FileText,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Check,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { mockDocuments, mockMessages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface DocMeta {
  docId: string;
  name: string;
  size: string;
  pages: number;
  uploadedAt: string;
  messageCount: number;
  color: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Markdown renderer (bold, inline code, bullets, numbered lists,
// fenced ```code blocks)
// ─────────────────────────────────────────────────────────────

/** Bold (**text**) and inline code (`text`) within a single line. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code key={i} className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/** Renders the non-code portion of a message: paragraphs, bullets, numbered lists. */
function TextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.trim().startsWith("- "))
          return (
            <li key={i} className="ml-4 list-disc leading-relaxed">
              {renderInline(line.trim().slice(2))}
            </li>
          );
        if (/^\d+\.\s/.test(line.trim()))
          return (
            <li key={i} className="ml-4 list-decimal leading-relaxed">
              {renderInline(line.trim().replace(/^\d+\.\s/, ""))}
            </li>
          );
        return (
          <p key={i} className="leading-relaxed">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/** Splits a message on fenced ```lang\n...\n``` blocks and renders each
 * segment as either a code block or regular markdown text. */
function MessageContent({ content }: { content: string }) {
  const segments = content.split(/```(\w*)\n?([\s\S]*?)```/g);
  // String.split with a capturing regex interleaves: [text, lang, code, text, lang, code, ..., text]
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < segments.length; i += 3) {
    const text = segments[i];
    const lang = segments[i + 1];
    const code = segments[i + 2];
    if (text) nodes.push(<TextBlock key={`t${i}`} text={text} />);
    if (code !== undefined) {
      nodes.push(
        <div key={`c${i}`} className="my-1.5 overflow-hidden rounded-lg border border-border/60 bg-foreground/[0.04]">
          {lang && (
            <div className="border-b border-border/60 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {lang}
            </div>
          )}
          <pre className="overflow-x-auto px-3 py-2.5 text-xs leading-relaxed">
            <code className="font-mono">{code.replace(/\n$/, "")}</code>
          </pre>
        </div>
      );
    }
  }
  return <div className="text-sm">{nodes}</div>;
}

// ─────────────────────────────────────────────────────────────
// Real PDF Viewer using iframe + sessionStorage blob
// ─────────────────────────────────────────────────────────────
function PDFViewer({ docId, name, pages }: { docId: string; name: string; pages: number }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const b64 = sessionStorage.getItem(`pdf_${docId}`);
    if (b64) {
      try {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        // Object URL is created here specifically so it can be revoked in
        // this effect's cleanup below — genuinely an effect, not derivable
        // during render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPdfUrl(objectUrl);
      } catch (e) {
        console.error("Failed to create PDF blob URL", e);
      }
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [docId]);

  const handleDownload = () => {
    const b64 = sessionStorage.getItem(`pdf_${docId}`);
    const fileName = sessionStorage.getItem(`pdf_name_${docId}`) ?? `${name}.pdf`;
    if (!b64) return;

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-background shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setScale((s) => Math.min(2, s + 0.25))}
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>{pages} pages</span>
        </div>

        <Button
          id="pdf-download-btn"
          variant="ghost" size="icon" className="h-7 w-7"
          onClick={handleDownload}
          title="Download PDF"
          disabled={!pdfUrl}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* PDF Display */}
      <div
        className="flex-1 overflow-auto bg-zinc-200 dark:bg-zinc-900 flex items-start justify-center p-3"
        style={{ minHeight: 0 }}
      >
        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            title={name}
            style={{
              width: `${scale * 100}%`,
              height: "100%",
              minHeight: "600px",
              border: "none",
              borderRadius: "4px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              background: "white",
              display: "block",
            }}
          />
        ) : (
          /* Fallback when PDF not in sessionStorage (e.g. page refresh) */
          <div className="flex flex-col items-center justify-center gap-4 h-full text-center px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF preview is only available immediately after upload.
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Re-upload the file to view it again here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Suggested starter questions
// ─────────────────────────────────────────────────────────────
const suggestions = [
  "Summarize this document",
  "What are the key findings?",
  "List the main conclusions",
  "What methodology was used?",
];

// ─────────────────────────────────────────────────────────────
// Chat Panel — live streaming API
// ─────────────────────────────────────────────────────────────
function ChatPanel({
  docId,
  docName,
  pages,
  isRealDoc,
  onMessageSent,
}: {
  docId: string;
  docName: string;
  pages: number;
  isRealDoc: boolean;
  onMessageSent?: () => void;
}) {
  const buildWelcome = (): ChatMessage => ({
    id: "m0",
    role: "assistant",
    content: `👋 I've analyzed **${docName}** (${pages} pages). Ask me anything about this document!`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  const CHAT_KEY = `chat_${docId}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Restore persisted history for real docs
    if (isRealDoc) {
      try {
        const saved = localStorage.getItem(CHAT_KEY);
        if (saved) return JSON.parse(saved) as ChatMessage[];
      } catch { /* ignore parse errors */ }
    }
    // Demo docs use mock messages
    if (!isRealDoc && mockMessages[docId]) return mockMessages[docId];
    return [buildWelcome()];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Persist chat history to localStorage (real docs only)
  useEffect(() => {
    if (!isRealDoc) return;
    // Don't save while a message is still streaming
    const hasStreaming = messages.some((m) => m.isStreaming);
    if (!hasStreaming) {
      try {
        localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
      } catch { /* storage full */ }
    }
  }, [messages, isRealDoc, CHAT_KEY]);

  const buildHistory = (msgs: ChatMessage[]) =>
    msgs
      .filter((m) => !m.isStreaming)
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`)
      .join("\n");

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isLoading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      if (!isRealDoc) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              content: "This is a **demo document**. Upload a real PDF to enable AI-powered responses!",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          setIsLoading(false);
          onMessageSent?.();
        }, 800);
        return;
      }

      const aiMsgId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isStreaming: true,
        },
      ]);

      abortRef.current = new AbortController();

      try {
        const chatHistory = buildHistory([...messages, userMsg]);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: content, chatHistory, namespace: docId }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
          );
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
        );
        onMessageSent?.();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: "⚠️ Connection failed. Please check the server and try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, messages, docId, isRealDoc, onMessageSent]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 shrink-0 bg-background">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-semibold text-sm">AI Assistant</span>
          <Badge variant={isRealDoc ? "success" : "outline"} className="text-[10px] px-1.5 py-0">
            {isRealDoc ? "Live" : "Demo"}
          </Badge>
        </div>
        <Button
          variant="ghost" size="icon" className="h-7 w-7"
          onClick={() => {
            localStorage.removeItem(CHAT_KEY);
            setMessages([buildWelcome()]);
          }}
          title="Reset chat"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            {msg.role === "assistant" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                {msg.isStreaming ? (
                  <Loader2 className="h-3.5 w-3.5 text-accent-foreground animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                )}
              </div>
            )}
            <div
              className={cn(
                "flex max-w-[80%] flex-col gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5",
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                )}
              >
                {msg.content ? (
                  <MessageContent content={msg.content} />
                ) : (
                  <div className="flex items-center gap-1 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
              </div>
              <span className="px-1 text-[10px] text-muted-foreground">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions — the chat's "empty state" */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <p className="mb-2.5 font-serif text-sm text-muted-foreground">Ask anything about this document</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-xs text-foreground transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm"
              >
                <Sparkles className="h-3 w-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-accent" />
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-accent/40 focus-within:ring-3 focus-within:ring-accent/15 transition-all">
          <Textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this document… (Enter to send)"
            className="flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 min-h-[36px] max-h-[140px]"
            rows={1}
            disabled={isLoading}
          />
          <Button
            id="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "h-8 w-8 shrink-0 rounded-lg p-0",
              !(input.trim() && !isLoading) && "bg-muted text-muted-foreground shadow-none hover:bg-muted"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          {isRealDoc
            ? "Powered by Google Gemini · Pinecone · LangChain"
            : "Upload a real PDF to enable AI responses"}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Share Button — Web Share API with clipboard fallback
// ─────────────────────────────────────────────────────────────
function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    // Use native share sheet on supported devices (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled share — fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — last resort
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      id="share-btn"
      variant="ghost"
      size="icon"
      className="h-8 w-8 relative"
      onClick={handleShare}
      title={copied ? "Copied!" : "Share this chat"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {copied && (
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-0.5 text-[10px] text-background shadow">
          Copied!
        </span>
      )}
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const { bumpMessageCount } = useDocuments(user?.email);

  const [doc, setDoc] = useState<DocMeta | null>(null);
  const [isMockDoc, setIsMockDoc] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Wait until auth has resolved so we know which user's key to read
    if (authLoading) return;

    // Redirect unauthenticated visitors to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Read from the per-user scoped key
    const userKey = `chatpdf_docs_${user.email.toLowerCase()}`;
    const stored: DocMeta[] = JSON.parse(localStorage.getItem(userKey) ?? "[]");
    const realDoc = stored.find((d) => d.docId === id);
    // Deliberately deferred to after mount/auth-resolution: depends on
    // localStorage (SSR-unsafe during render) and on `user`/`authLoading`
    // settling first, both genuinely external to this render.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (realDoc) {
      setDoc(realDoc);
      setIsMockDoc(false);
    } else {
      const mock = mockDocuments.find((d) => d.id === id);
      if (mock) {
        setDoc({
          docId: mock.id,
          name: mock.name,
          size: mock.size,
          pages: mock.pages,
          uploadedAt: mock.uploadedAt,
          messageCount: mock.messageCount,
          color: mock.color,
        });
        setIsMockDoc(true);
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    setLoaded(true);
  }, [id, user, authLoading, router]);

  if (authLoading || !loaded) return null;

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
      {/* Top navbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 bg-background/95 backdrop-blur z-40">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="truncate text-sm font-semibold text-foreground max-w-xs">
            {doc.name}
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 shrink-0">
            {doc.pages} pages
          </Badge>
          {!isMockDoc && (
            <Badge variant="success" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 shrink-0">
              AI Ready
            </Badge>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ShareButton />
          <ModeToggle />
        </div>
      </header>

      {/* Split: PDF viewer left, chat right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: PDF viewer (real iframe) */}
        <div className="hidden md:flex w-[45%] shrink-0 flex-col border-r border-border overflow-hidden">
          <PDFViewer docId={doc.docId} name={doc.name} pages={doc.pages} />
        </div>

        {/* Right: Chat */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatPanel
            docId={doc.docId}
            docName={doc.name}
            pages={doc.pages}
            isRealDoc={!isMockDoc}
            onMessageSent={() => bumpMessageCount(doc.docId)}
          />
        </div>
      </div>
    </div>
  );
}
