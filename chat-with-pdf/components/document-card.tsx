import Link from "next/link";
import { FileText, MessageSquare, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PDFDocument } from "@/lib/mock-data";

const colorTopMap: Record<PDFDocument["color"], string> = {
  violet: "from-violet-500 to-violet-600",
  blue: "from-blue-500 to-sky-500",
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-400 to-orange-500",
  rose: "from-rose-500 to-pink-500",
  indigo: "from-indigo-500 to-violet-500",
};

const colorIconMap: Record<PDFDocument["color"], string> = {
  violet: "text-violet-600 bg-violet-50 dark:bg-violet-900/30",
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/30",
  emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
  amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
  rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/30",
  indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
};

export function DocumentCard({ doc }: { doc: PDFDocument }) {
  const isReady = doc.status === "ready";

  return (
    <Link
      href={isReady ? `/chat/${doc.id}` : "#"}
      id={`doc-card-${doc.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200",
        isReady
          ? "hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-200 dark:hover:border-violet-800 cursor-pointer"
          : "opacity-80 cursor-default"
      )}
    >
      {/* Color accent top bar */}
      <div
        className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          colorTopMap[doc.color]
        )}
      />

      <div className="flex flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              colorIconMap[doc.color]
            )}
          >
            {doc.status === "processing" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          {doc.status === "processing" ? (
            <Badge className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 rounded-full">
              Processing
            </Badge>
          ) : (
            <Badge className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 rounded-full">
              Ready
            </Badge>
          )}
        </div>

        {/* Name */}
        <div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
            {doc.name}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {doc.summary}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/60">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {doc.pages} pages
          </span>
          <span>·</span>
          <span>{doc.size}</span>
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

        {/* Upload time */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {doc.lastChatted ? `Chatted ${doc.lastChatted}` : doc.uploadedAt}
          </span>
          {isReady && (
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Open chat →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
