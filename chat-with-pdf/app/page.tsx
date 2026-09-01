"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar, SidebarDrawer } from "@/components/sidebar";
import { UploadZone } from "@/components/upload-zone";
import { DocumentCard } from "@/components/document-card";
import { useDocuments } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { FileText, TrendingUp, MessageSquare, Plus, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { docs, removeDoc } = useDocuments(user?.email);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null; // avoid flash

  const filteredDocs = search.trim()
    ? docs.filter((d) =>
        d.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : docs;

  const totalMessages = docs.reduce((a, d) => a + d.messageCount, 0);

  const stats = [
    { label: "Documents", sublabel: "Your library", value: docs.length, icon: FileText },
    { label: "Ready to chat", sublabel: "AI-ready documents", value: docs.length, icon: Sparkles },
    { label: "Conversations", sublabel: "Questions answered", value: totalMessages, icon: MessageSquare },
  ];

  // Real activity, derived from existing document metadata — most recently
  // uploaded first (the order useDocuments already keeps), one line each.
  const activity = docs.slice(0, 4).map((d) =>
    d.lastChatted
      ? { doc: d, icon: MessageCircle, text: `Chatted with ${d.name}`, when: d.lastChatted }
      : { doc: d, icon: FileText, text: `Uploaded ${d.name}`, when: d.uploadedAt }
  );

  return (
    <div className="flex min-h-screen flex-col">
      {showUploadModal && (
        <UploadZone modal onClose={() => setShowUploadModal(false)} />
      )}

      <Navbar
        onUploadClick={() => setShowUploadModal(true)}
        onMenuClick={() => setMobileNavOpen(true)}
        search={search}
        onSearchChange={setSearch}
      />

      <SidebarDrawer
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        onUploadClick={() => setShowUploadModal(true)}
      />

      <div className="flex flex-1">
        <Sidebar onUploadClick={() => setShowUploadModal(true)} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
            {/* Hero */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
              <div className="relative">
                <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">Your library</p>
                <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                  Your documents
                </h1>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Everything you need to read, understand, and work with your PDFs.
                </p>
              </div>

              {/* Subtle decorative document-stack, echoes the upload panel's motif */}
              <div className="relative hidden h-16 w-16 shrink-0 sm:block">
                <div className="absolute inset-x-2 top-2 h-full rounded-md border border-border bg-muted/50 rotate-[-8deg]" />
                <div className="absolute inset-x-1 top-1 h-full rounded-md border border-border bg-muted rotate-[5deg]" />
                <div className="absolute inset-0 flex items-center justify-center rounded-md border border-border bg-card shadow-sm">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
              </div>
            </div>

            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
              <Button onClick={() => setShowUploadModal(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Document
              </Button>

              {/* Stats — three distinct visual treatments, not identical boxes */}
              <div className="flex items-stretch gap-px overflow-hidden rounded-lg border border-border bg-border">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="animate-in fade-in slide-in-from-bottom-1 flex items-center gap-2.5 bg-card px-4 py-3"
                    style={{ animationDelay: `${i * 80}ms`, animationDuration: "400ms", animationFillMode: "backwards" }}
                  >
                    <s.icon className="h-3.5 w-3.5 text-accent" />
                    <div className="leading-tight">
                      <p className="font-serif text-lg font-medium text-foreground">
                        {String(s.value).padStart(2, "0")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{s.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload zone */}
            <div className="mb-10">
              <UploadZone />
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_15rem]">
              {/* Documents grid */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-medium text-foreground">
                    {search.trim() ? `Results for "${search}"` : "Recent documents"}
                  </h2>
                  <span className="text-xs text-muted-foreground">{filteredDocs.length} of {docs.length}</span>
                </div>

                {docs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-border py-16 text-center px-6">
                    <div className="relative h-14 w-14">
                      <div className="absolute inset-x-1.5 top-1.5 h-full rounded-md border border-border bg-muted/60 rotate-[-6deg]" />
                      <div className="absolute inset-0 flex items-center justify-center rounded-md border border-border bg-card shadow-sm">
                        <FileText className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold tracking-widest text-accent uppercase">Your library</p>
                      <p className="font-serif text-xl font-medium text-foreground">Your knowledge starts here.</p>
                      <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                        Upload your first PDF and start asking questions about it.
                      </p>
                    </div>
                    <Button onClick={() => setShowUploadModal(true)}>
                      Upload your first PDF
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-muted-foreground/70" /> Fast PDF processing</span>
                      <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-muted-foreground/70" /> Ask questions naturally</span>
                      <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-muted-foreground/70" /> Understand documents faster</span>
                    </div>
                  </div>
                ) : filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                    <FileText className="h-7 w-7 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">No documents match &ldquo;{search}&rdquo;</p>
                    <p className="text-sm text-muted-foreground">Try a different search term</p>
                    <Button variant="outline" onClick={() => setSearch("")} className="mt-1">
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredDocs.map((doc, i) => (
                      <div
                        key={doc.docId}
                        className="animate-in fade-in slide-in-from-bottom-1"
                        style={{ animationDelay: `${Math.min(i, 6) * 60}ms`, animationDuration: "350ms", animationFillMode: "backwards" }}
                      >
                        <DocumentCard doc={doc} onDelete={removeDoc} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent activity — built only from real document/chat metadata */}
              {activity.length > 0 && (
                <div className="lg:border-l lg:border-border lg:pl-8">
                  <h2 className="mb-4 font-serif text-lg font-medium text-foreground">Recent activity</h2>
                  <ul className="space-y-4">
                    {activity.map(({ doc, icon: Icon, text, when }) => (
                      <li key={doc.docId} className="flex gap-2.5 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                          <Icon className="h-3 w-3 text-accent" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground leading-snug truncate">{text}</p>
                          <p className="text-xs text-muted-foreground">{when}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
