"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Clock, FolderOpen, Plus, Trash2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocuments, type StoredDoc } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const colorDotMap: Record<StoredDoc["color"], string> = {
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

function SidebarItem({
  doc,
  onDelete,
}: {
  doc: StoredDoc;
  onDelete: (id: string) => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${doc.docId}`;

  return (
    <div
      className={cn(
        "group flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
        isActive
          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          : "hover:bg-muted text-foreground"
      )}
    >
      <div className="mt-2 shrink-0">
        <div className={cn("h-2 w-2 rounded-full", colorDotMap[doc.color])} />
      </div>

      <Link
        href={`/chat/${doc.docId}`}
        className="flex-1 min-w-0"
      >
        <p className={cn("font-medium leading-snug truncate text-sm", isActive ? "text-violet-700 dark:text-violet-300" : "")}>
          {doc.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {doc.lastChatted ? `Chatted ${doc.lastChatted}` : doc.uploadedAt}
        </p>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); onDelete(doc.docId); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-muted-foreground hover:text-rose-500"
        title="Remove document"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface SidebarProps {
  onUploadClick?: () => void;
}

export function Sidebar({ onUploadClick }: SidebarProps) {
  const { docs, removeDoc } = useDocuments();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-background h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex flex-col gap-1 p-3 flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <FolderOpen className="h-3.5 w-3.5" />
          My Documents
          <span className="ml-auto text-foreground font-medium">{docs.length}</span>
        </div>

        {/* Upload shortcut */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-dashed border-muted-foreground/40">
            <Plus className="h-3 w-3" />
          </div>
          <span>New Document</span>
        </button>

        {/* Document list */}
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No documents yet</p>
            <p className="text-xs text-muted-foreground/70">Upload a PDF to get started</p>
          </div>
        ) : (
          <div className="mt-1">
            <div className="flex items-center gap-1.5 px-3 mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Recent</span>
            </div>
            {docs.map((doc) => (
              <SidebarItem key={doc.docId} doc={doc} onDelete={removeDoc} />
            ))}
          </div>
        )}
      </div>

      {/* Footer — user info + logout */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-muted-foreground hover:text-rose-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
