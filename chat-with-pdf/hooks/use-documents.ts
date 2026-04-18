"use client";

import { useState, useEffect, useCallback } from "react";

export interface StoredDoc {
  docId: string;
  name: string;
  size: string;
  pages: number;
  uploadedAt: string;
  messageCount: number;
  color: "violet" | "blue" | "emerald" | "amber" | "rose" | "indigo";
  lastChatted?: string;
}

const STORAGE_KEY = "chatpdf_docs";

function readDocs(): StoredDoc[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeDocs(docs: StoredDoc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  // Notify other components on the same page
  window.dispatchEvent(new CustomEvent("chatpdf_docs_changed"));
}

export function useDocuments() {
  const [docs, setDocs] = useState<StoredDoc[]>([]);

  const refresh = useCallback(() => setDocs(readDocs()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("chatpdf_docs_changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("chatpdf_docs_changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const addDoc = useCallback((doc: StoredDoc) => {
    const existing = readDocs().filter((d) => d.docId !== doc.docId);
    writeDocs([doc, ...existing]);
    refresh();
  }, [refresh]);

  const removeDoc = useCallback((docId: string) => {
    writeDocs(readDocs().filter((d) => d.docId !== docId));
    refresh();
  }, [refresh]);

  const bumpMessageCount = useCallback((docId: string) => {
    const all = readDocs();
    const updated = all.map((d) =>
      d.docId === docId
        ? {
            ...d,
            messageCount: d.messageCount + 1,
            lastChatted: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          }
        : d
    );
    writeDocs(updated);
    refresh();
  }, [refresh]);

  return { docs, addDoc, removeDoc, bumpMessageCount, refresh };
}
