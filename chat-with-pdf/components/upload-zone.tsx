"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CloudUpload, FileText, X, Loader2, CheckCircle2, AlertCircle,
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
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200",
        isDragging
          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 scale-[1.01]"
          : uploadState === "success"
          ? "border-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10"
          : uploadState === "error"
          ? "border-rose-400 bg-rose-50/40 dark:bg-rose-900/10"
          : "border-border hover:border-violet-400 hover:bg-muted/40 bg-muted/20"
      )}
    >
      {uploadState === "idle" && (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CloudUpload className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-1 text-base font-semibold text-foreground">
            {isDragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
          </p>
          <p className="mb-5 text-sm text-muted-foreground">or click to browse from your computer</p>
          <Button
            variant="outline"
            className="rounded-xl border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
            onClick={() => document.getElementById("file-upload-input")?.click()}
          >
            Browse Files
          </Button>
          <input id="file-upload-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          <p className="mt-4 text-xs text-muted-foreground">Supports PDF files up to 50 MB</p>
        </>
      )}

      {uploadState === "selected" && selectedFile && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20">
            <FileText className="h-8 w-8 text-violet-600" />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 px-4 py-2.5 border border-violet-200 dark:border-violet-800">
            <FileText className="h-4 w-4 text-violet-600 shrink-0" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300 max-w-[220px] truncate">
              {selectedFile.name}
            </span>
            <button onClick={reset} className="text-violet-400 hover:text-violet-600 transition-colors ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <Button
            onClick={handleUpload}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8"
          >
            Upload & Analyze
          </Button>
        </div>
      )}

      {uploadState === "uploading" && (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20">
            <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
          </div>
          <p className="font-semibold text-foreground">Processing your PDF…</p>
          <p className="text-sm text-muted-foreground">Chunking, embedding & storing in Pinecone</p>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-1">
            <div className="h-full bg-violet-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      )}

      {uploadState === "success" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">Upload complete!</p>
          <p className="text-sm text-muted-foreground">Redirecting to your chat…</p>
        </div>
      )}

      {uploadState === "error" && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/20">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <p className="font-semibold text-rose-700 dark:text-rose-400">Upload failed</p>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button variant="outline" className="rounded-xl" onClick={reset}>Try Again</Button>
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
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Upload a PDF</h2>
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
