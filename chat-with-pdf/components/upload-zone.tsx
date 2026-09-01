"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText, X, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDocuments, type StoredDoc } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";

type UploadState = "idle" | "selected" | "uploading" | "success" | "error";
const COLORS = ["violet", "blue", "emerald", "amber", "rose", "indigo"] as const;
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

interface Props {
  /** If true, wraps in a modal overlay. If false, renders inline. */
  modal?: boolean;
  onClose?: () => void;
}

export function UploadZone({ modal = false, onClose }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { addDoc } = useDocuments(user?.email);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, onClose]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      setUploadState("selected");
      setErrorMsg("");
    } else {
      setErrorMsg("Only PDF files are supported.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setUploadState("selected"); setErrorMsg(""); }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadState("uploading");
    setProgress(0);

    const interval = setInterval(() => setProgress((p) => Math.min(p + 3, 90)), 400);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }

      const doc = await res.json();
      setProgress(100);
      setUploadState("success");

      // Persist to shared hook (fires event so sidebar/dashboard update)
      const storedDoc: StoredDoc = {
        ...doc,
        messageCount: 0,
        color: randomColor(),
      };
      addDoc(storedDoc);

      // Save raw PDF bytes so chat page can show real viewer
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const b64 = (reader.result as string).split(",")[1];
          sessionStorage.setItem(`pdf_${doc.docId}`, b64);
          sessionStorage.setItem(`pdf_name_${doc.docId}`, selectedFile.name);
        } catch { /* sessionStorage full */ }
      };
      reader.readAsDataURL(selectedFile);

      setTimeout(() => {
        onClose?.();
        router.push(`/chat/${doc.docId}`);
      }, 900);
    } catch (err: unknown) {
      clearInterval(interval);
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setUploadState("idle");
    setErrorMsg("");
    setProgress(0);
  };

  const zone = (
    <div
      id="upload-zone"
      onDragOver={uploadState === "idle" || uploadState === "selected" ? handleDragOver : undefined}
      onDragLeave={handleDragLeave}
      onDrop={uploadState === "idle" || uploadState === "selected" ? handleDrop : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all duration-200",
        uploadState === "idle" && "text-left",
        isDragging
          ? "border-accent bg-accent/5 scale-[1.005]"
          : uploadState === "success"
          ? "border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-900/10"
          : uploadState === "error"
          ? "border-destructive/50 bg-destructive/5"
          : "border-border hover:border-accent/40 bg-card"
      )}
    >
      {uploadState === "idle" && (
        <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
          {/* CSS document-stack illustration */}
          <div className={cn("relative h-24 w-24 shrink-0 transition-transform duration-300", isDragging && "scale-110")}>
            <div className="absolute inset-x-3 top-3 h-full rounded-md border border-border bg-muted/60 rotate-[-6deg]" />
            <div className="absolute inset-x-1.5 top-1.5 h-full rounded-md border border-border bg-muted rotate-[4deg]" />
            <div className="absolute inset-0 flex flex-col gap-1.5 rounded-md border border-border bg-card p-3 shadow-sm">
              <div className="h-1.5 w-1/2 rounded-full bg-accent/50" />
              <div className="h-1 w-full rounded-full bg-foreground/10" />
              <div className="h-1 w-4/5 rounded-full bg-foreground/10" />
              <div className="h-1 w-full rounded-full bg-foreground/10" />
              <div className="h-1 w-2/3 rounded-full bg-foreground/10" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-foreground font-serif">
              {isDragging ? "Drop it right here" : "Start with a document"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Drop a PDF here and turn it into an interactive conversation, or browse from your computer.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={() => document.getElementById("file-upload-input")?.click()}>
                Upload PDF
              </Button>
              <span className="text-xs text-muted-foreground">or drag and drop</span>
            </div>
            <input id="file-upload-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground/70" /> Up to 50 MB</span>
              <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 text-muted-foreground/70" /> Fast processing</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/70" /> AI-powered analysis</span>
            </div>
          </div>
        </div>
      )}

      {uploadState === "selected" && selectedFile && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5 border border-border">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground max-w-[220px] truncate">
              {selectedFile.name}
            </span>
            <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <Button onClick={handleUpload} className="px-8">
            Upload &amp; analyze
          </Button>
        </div>
      )}

      {uploadState === "uploading" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
            <Loader2 className="h-6 w-6 text-accent animate-spin" />
          </div>
          <p className="font-semibold text-foreground">Processing your PDF…</p>
          <p className="text-sm text-muted-foreground">Chunking, embedding &amp; storing in Pinecone</p>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-1">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      )}

      {uploadState === "success" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">Upload complete</p>
          <p className="text-sm text-muted-foreground">Redirecting to your chat…</p>
        </div>
      )}

      {uploadState === "error" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <p className="font-semibold text-foreground">Upload failed</p>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button variant="outline" onClick={reset}>Try again</Button>
        </div>
      )}
    </div>
  );

  if (!modal) return <div className="w-full">{zone}</div>;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <div className="relative w-full max-w-lg bg-card rounded-xl shadow-lg border border-border p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload a PDF</h2>
            <p className="text-sm text-muted-foreground">Your document will be indexed for AI chat</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {zone}
      </div>
    </div>
  );
}
