"use client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { UploadZone } from "@/components/upload-zone";
import { DocumentCard } from "@/components/document-card";
import { mockDocuments } from "@/lib/mock-data";
import { FileText, TrendingUp, MessageSquare } from "lucide-react";

const stats = [
  {
    label: "Documents",
    value: mockDocuments.length,
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    label: "Ready to Chat",
    value: mockDocuments.filter((d) => d.status === "ready").length,
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    label: "Total Chats",
    value: mockDocuments.reduce((a, d) => a + d.messageCount, 0),
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Your Documents
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a PDF and start a conversation with its content.
              </p>
            </div>

            {/* Stats row */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}
                  >
                    <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload zone */}
            <div className="mb-10">
              <UploadZone />
            </div>

            {/* Documents section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Recent Documents
                </h2>
                <span className="text-xs text-muted-foreground">
                  {mockDocuments.length} total
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mockDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
