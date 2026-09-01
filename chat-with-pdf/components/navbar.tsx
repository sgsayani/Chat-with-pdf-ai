"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  showSearch?: boolean;
  onUploadClick?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function Navbar({
  showSearch = true,
  onUploadClick,
  search = "",
  onSearchChange,
}: NavbarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K focuses the search field, matching the hint shown in it.
  useEffect(() => {
    if (!showSearch) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground transition-transform duration-200 group-hover:scale-105">
            <FileText className="h-4 w-4 text-background" />
          </div>
          <span className="hidden font-semibold text-lg tracking-tight sm:block text-foreground">
            Chat<span className="text-accent">PDF</span>
          </span>
        </Link>

        {/* Search — controlled */}
        {showSearch && (
          <div className="hidden flex-1 max-w-sm md:flex mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="navbar-search"
                ref={searchRef}
                placeholder="Search documents…"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9 h-9 bg-muted/60 border-transparent focus-visible:border-accent/40 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-accent/15"
              />
              {search ? (
                <button
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                >
                  ✕
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:flex">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            id="navbar-upload-btn"
            onClick={onUploadClick}
            className="hidden sm:flex h-9 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Document
          </Button>
          <Button
            id="navbar-upload-mobile"
            onClick={onUploadClick}
            size="icon"
            className="sm:hidden h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
