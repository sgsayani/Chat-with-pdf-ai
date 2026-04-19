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

/** Returns a per-user localStorage key so documents are isolated between accounts. */
function storageKey(userEmail?: string | null): string {
  return userEmail ? `chatpdf_docs_${userEmail.toLowerCase()}` : "";
}

function readDocs(key: string): StoredDoc[] {
  if (!key || typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function writeDocs(key: string, docs: StoredDoc[]) {
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(docs));
  // Notify other components on the same page
  window.dispatchEvent(new CustomEvent("chatpdf_docs_changed"));
}

/**
 * Pass the current user's email so documents are scoped per account.
 * If userEmail is undefined/null the hook is a no-op (returns empty list).
 */
export function useDocuments(userEmail?: string | null) {
  const key = storageKey(userEmail);
  const [docs, setDocs] = useState<StoredDoc[]>([]);

  const refresh = useCallback(() => setDocs(readDocs(key)), [key]);

  useEffect(() => {
    // Re-read whenever the user changes (e.g. fresh signup)
    refresh();
    window.addEventListener("chatpdf_docs_changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("chatpdf_docs_changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const addDoc = useCallback((doc: StoredDoc) => {
    const existing = readDocs(key).filter((d) => d.docId !== doc.docId);
    writeDocs(key, [doc, ...existing]);
    refresh();
  }, [key, refresh]);

  const removeDoc = useCallback((docId: string) => {
    writeDocs(key, readDocs(key).filter((d) => d.docId !== docId));
    refresh();
  }, [key, refresh]);

  const bumpMessageCount = useCallback((docId: string) => {
    const all = readDocs(key);
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
    writeDocs(key, updated);
    refresh();
  }, [key, refresh]);

  return { docs, addDoc, removeDoc, bumpMessageCount, refresh };
}
