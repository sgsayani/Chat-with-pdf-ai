"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Clock, FolderOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockDocuments, type PDFDocument } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const colorDotMap: Record<PDFDocument["color"], string> = {
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

function SidebarItem({ doc }: { doc: PDFDocument }) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${doc.id}`;

  return (
    <Link
      href={doc.status === "ready" ? `/chat/${doc.id}` : "#"}
      id={`sidebar-doc-${doc.id}`}
      className={cn(
        "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
        isActive
          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          : "hover:bg-muted text-foreground"
      )}
    >
      <div className="mt-0.5 shrink-0">
        <div
          className={cn(
            "h-2 w-2 rounded-full mt-1.5",
            colorDotMap[doc.color]
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium leading-snug truncate",
            isActive ? "text-violet-700 dark:text-violet-300" : ""
          )}
        >
          {doc.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          {doc.status === "processing" ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing…
            </>
          ) : (
            <>{doc.lastChatted ?? doc.uploadedAt}</>
          )}
        </p>
      </div>
      {doc.status === "processing" && (
        <Badge className="shrink-0 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
          Processing
        </Badge>
      )}
    </Link>
  );
}

export function Sidebar() {
  const readyDocs = mockDocuments.filter((d) => d.status === "ready");
  const processingDocs = mockDocuments.filter((d) => d.status === "processing");

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-background h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex flex-col gap-1 p-3">
        {/* All Documents label */}
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <FolderOpen className="h-3.5 w-3.5" />
          All Documents
          <span className="ml-auto text-foreground font-medium">
            {mockDocuments.length}
          </span>
        </div>

        {/* Recent */}
        <div className="mt-1">
          <div className="flex items-center gap-1.5 px-3 mb-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Recent
            </span>
          </div>
          {readyDocs.map((doc) => (
            <SidebarItem key={doc.id} doc={doc} />
          ))}
        </div>

        {/* Processing */}
        {processingDocs.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="flex items-center gap-1.5 px-3 mb-1">
              <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground font-medium">
                Processing
              </span>
            </div>
            {processingDocs.map((doc) => (
              <SidebarItem key={doc.id} doc={doc} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-semibold shrink-0">
            U
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-muted-foreground">{readyDocs.length} documents</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
