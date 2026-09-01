"use client";

import Link from "next/link";
import { FileText, MessageSquare, Clock, Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StoredDoc } from "@/hooks/use-documents";

/** Deterministic pseudo-random line lengths per document, so the CSS
 * "page" mockup looks like distinct paragraphs instead of repeating. */
function lineWidths(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const widths: number[] = [];
  for (let i = 0; i < 6; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    widths.push(55 + (h % 40)); // 55–95%
  }
  return widths;
}

export function DocumentCard({
  doc,
  onDelete,
}: {
  doc: StoredDoc;
  onDelete?: (docId: string) => void;
}) {
  const widths = lineWidths(doc.docId);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-foreground/5">
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); onDelete(doc.docId); }}
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-muted-foreground opacity-0 shadow-sm group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
          title="Remove document"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <Link href={`/chat/${doc.docId}`} className="flex flex-col flex-1">
        {/* CSS "page" preview mockup */}
        <div className="relative h-32 shrink-0 overflow-hidden bg-muted/60 border-b border-border">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="mt-3 w-[72%] scale-95 rounded-[2px] bg-card px-3 py-3 shadow-sm ring-1 ring-foreground/5 transition-transform duration-300 group-hover:scale-100">
              <div className="mb-2 h-1.5 w-1/3 rounded-full bg-foreground/15" />
              {widths.map((w, i) => (
                <div
                  key={i}
                  className="mb-1 h-[3px] rounded-full bg-foreground/10"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute left-2 top-2 flex h-5 items-center rounded bg-foreground/85 px-1.5 text-[9px] font-semibold tracking-wide text-background">
            PDF
          </div>
          <ArrowRight className="absolute bottom-2 right-2 h-3.5 w-3.5 -translate-x-1 text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>

        <div className="flex flex-col gap-2.5 p-4 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-accent transition-colors">
              {doc.name}
            </h3>
            <Badge variant="success" className="shrink-0 text-[10px] px-2 py-0.5">
              Ready
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{doc.pages} pages · {doc.size}</p>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2.5 border-t border-border/60">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {doc.lastChatted ? `Chatted ${doc.lastChatted}` : doc.uploadedAt}
            </span>
            {doc.messageCount > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {doc.messageCount}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
