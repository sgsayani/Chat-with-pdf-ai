"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FileText, Plus, Search, Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  showSearch?: boolean;
  onUploadClick?: () => void;
  onMenuClick?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function Navbar({
  showSearch = true,
  onUploadClick,
  onMenuClick,
  search = "",
  onSearchChange,
}: NavbarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // ⌘K / Ctrl+K focuses the search field, matching the hint shown in it.
  useEffect(() => {
    if (!showSearch) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setMobileSearchOpen(true);
        } else {
          searchRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch]);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {mobileSearchOpen ? (
        // Mobile search row — replaces the whole header while active, since
        // search has no home in the compact mobile layout otherwise.
        <div className="flex h-16 items-center gap-2 px-4 md:hidden">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={mobileSearchRef}
            placeholder="Search documents…"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="h-9 flex-1 border-transparent bg-muted/60"
          />
          <button
            onClick={() => { setMobileSearchOpen(false); onSearchChange?.(""); }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          {/* Mobile menu — opens the document drawer (sidebar is hidden below md) */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors md:hidden"
              aria-label="Open documents menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground transition-transform duration-200 group-hover:scale-105">
              <FileText className="h-4 w-4 text-background" />
            </div>
            <span className="hidden font-semibold text-lg tracking-tight sm:block text-foreground">
              Chat<span className="text-accent">PDF</span>
            </span>
          </Link>

          {/* Search — controlled, desktop inline */}
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
            {/* Search — mobile trigger */}
            {showSearch && (
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
                aria-label="Search documents"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
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
      )}
    </header>
  );
}
