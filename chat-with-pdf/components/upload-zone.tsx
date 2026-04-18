"use client";

import { useState, useCallback } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="w-full">
      <div
        id="upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200",
          isDragging
            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 scale-[1.01]"
            : "border-border hover:border-violet-400 hover:bg-muted/40 bg-muted/20"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200",
            isDragging
              ? "bg-violet-100 dark:bg-violet-900/40"
              : "bg-muted dark:bg-muted/50"
          )}
        >
          <CloudUpload
            className={cn(
              "h-8 w-8 transition-colors duration-200",
              isDragging ? "text-violet-600" : "text-muted-foreground"
            )}
          />
        </div>

        {selectedFile ? (
          /* Selected file preview */
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 px-4 py-2.5 border border-violet-200 dark:border-violet-800">
              <FileText className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300 max-w-[200px] truncate">
                {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-1 text-violet-400 hover:text-violet-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              id="upload-submit-btn"
              className="mt-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 shadow-sm shadow-violet-200 dark:shadow-violet-900/30"
            >
              Upload & Analyze
            </Button>
          </div>
        ) : (
          /* Default state */
          <>
            <p className="mb-1 text-base font-semibold text-foreground">
              {isDragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
            <label htmlFor="file-upload">
              <Button
                id="browse-files-btn"
                variant="outline"
                className="cursor-pointer rounded-xl border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-400"
                asChild={false}
                onClick={() =>
                  document.getElementById("file-upload")?.click()
                }
              >
                Browse Files
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="mt-4 text-xs text-muted-foreground">
              Supports PDF files up to 50 MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
