"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { UploadZone } from "@/components/upload-zone";
import { DocumentCard } from "@/components/document-card";
import { useDocuments } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { FileText, TrendingUp, MessageSquare, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
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
    { label: "Documents", value: docs.length, icon: FileText, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Ready to Chat", value: docs.length, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Total Chats", value: totalMessages, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showUploadModal && (
        <UploadZone modal onClose={() => setShowUploadModal(false)} />
      )}

      <Navbar
        onUploadClick={() => setShowUploadModal(true)}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex flex-1">
        <Sidebar onUploadClick={() => setShowUploadModal(true)} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a PDF and start a conversation with its content.
              </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload zone */}
            <div className="mb-10">
              <UploadZone />
            </div>

            {/* Documents grid */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  {search.trim() ? `Results for "${search}"` : "Recent Documents"}
                </h2>
                <span className="text-xs text-muted-foreground">{filteredDocs.length} of {docs.length}</span>
              </div>

              {docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <UploadCloud className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No documents yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Upload your first PDF above to get started</p>
                  </div>
                  <Button onClick={() => setShowUploadModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl mt-1">
                    Upload a PDF
                  </Button>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-12 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                  <p className="font-semibold text-foreground">No documents match &ldquo;{search}&rdquo;</p>
                  <p className="text-sm text-muted-foreground">Try a different search term</p>
                  <Button variant="outline" onClick={() => setSearch("")} className="rounded-xl mt-1">
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDocs.map((doc) => (
                    <DocumentCard key={doc.docId} doc={doc} onDelete={removeDoc} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
