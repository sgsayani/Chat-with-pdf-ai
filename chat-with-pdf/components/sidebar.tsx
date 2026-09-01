"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Clock, FolderOpen, Plus, Trash2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocuments, type StoredDoc } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

function SidebarItem({
  doc,
  onDelete,
}: {
  doc: StoredDoc;
  onDelete: (id: string) => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${doc.docId}`;
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all duration-150",
        isActive
          ? "bg-accent/10 text-accent-foreground"
          : "hover:bg-muted hover:translate-x-0.5 text-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />
      )}
      <FileText className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors", isActive ? "text-accent" : "text-muted-foreground/60 group-hover:text-accent")} />

      <Link
        href={`/chat/${doc.docId}`}
        className="flex-1 min-w-0"
      >
        <p className={cn("font-medium leading-snug truncate text-sm", isActive ? "text-foreground" : "")}>
          {doc.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {doc.lastChatted ? `Chatted ${doc.lastChatted}` : doc.uploadedAt}
        </p>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); setConfirmOpen(true); }}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity mt-0.5 text-muted-foreground hover:text-destructive"
        title="Remove document"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        docName={doc.name}
        onConfirm={() => onDelete(doc.docId)}
      />
    </div>
  );
}

interface SidebarProps {
  onUploadClick?: () => void;
}

/** Shared list body — rendered inside the desktop <aside> and the mobile
 * drawer alike, so both stay in sync with zero duplicated logic. */
function SidebarBody({ onUploadClick }: SidebarProps) {
  const { user, logout } = useAuth();
  const { docs, removeDoc } = useDocuments(user?.email);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <FolderOpen className="h-3.5 w-3.5" />
          Documents
          <span className="ml-auto text-foreground font-medium normal-case">{docs.length}</span>
        </div>

        {/* Upload shortcut */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-dashed border-muted-foreground/40">
            <Plus className="h-3 w-3" />
          </div>
          <span>New document</span>
        </button>

        {/* Document list */}
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <FileText className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No documents yet</p>
            <p className="text-xs text-muted-foreground/70">Upload a PDF to get started</p>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex items-center gap-1.5 px-2.5 mb-1">
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
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate leading-tight">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/** Desktop sidebar — persistent column, hidden below md. */
export function Sidebar({ onUploadClick }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <SidebarBody onUploadClick={onUploadClick} />
    </aside>
  );
}

interface SidebarDrawerProps extends SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mobile equivalent of <Sidebar> — same document list and account footer,
 * reached via the navbar's menu button below the md breakpoint (the
 * desktop sidebar is hidden there and would otherwise be unreachable). */
export function SidebarDrawer({ open, onOpenChange, onUploadClick }: SidebarDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerContent className="flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <DrawerHeader className="border-b border-border pb-3">
          <DrawerTitle>Documents</DrawerTitle>
          <DrawerDescription className="sr-only">Your uploaded documents</DrawerDescription>
        </DrawerHeader>
        <SidebarBody
          onUploadClick={() => {
            onOpenChange(false);
            onUploadClick?.();
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
