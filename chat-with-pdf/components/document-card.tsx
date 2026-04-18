"use client";

import Link from "next/link";
import { FileText, MessageSquare, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StoredDoc } from "@/hooks/use-documents";

const colorTopMap: Record<StoredDoc["color"], string> = {
  violet: "from-violet-500 to-violet-600",
  blue: "from-blue-500 to-sky-500",
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-400 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  indigo: "from-indigo-500 to-violet-500",
};

const colorIconMap: Record<StoredDoc["color"], string> = {
  violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/30",
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
  emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
  amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
  rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/30",
  indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
};

export function DocumentCard({
  doc,
  onDelete,
}: {
  doc: StoredDoc;
  onDelete?: (docId: string) => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-800">
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { e.preventDefault(); onDelete(doc.docId); }}
          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          title="Remove document"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Color accent bar */}
      <div className={cn("h-1.5 w-full bg-gradient-to-r", colorTopMap[doc.color])} />

      <Link href={`/chat/${doc.docId}`} className="flex flex-col gap-3 p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorIconMap[doc.color])}>
            <FileText className="h-5 w-5" />
          </div>
          <Badge className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 rounded-full">
            Ready
          </Badge>
        </div>

        {/* Name */}
        <div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
            {doc.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{doc.size} · {doc.pages} pages</p>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/60">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {doc.lastChatted ? `Chatted ${doc.lastChatted}` : doc.uploadedAt}
          </span>
          {doc.messageCount > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {doc.messageCount} msgs
              </span>
            </>
          )}
          <span className="ml-auto text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Open →
          </span>
        </div>
      </Link>
    </div>
  );
}
