"use client";

import Link from "next/link";
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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="hidden font-bold text-lg tracking-tight sm:block">
            <span className="text-violet-600">Chat</span>PDF
          </span>
        </Link>

        {/* Search — controlled */}
        {showSearch && (
          <div className="hidden flex-1 max-w-sm md:flex mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="navbar-search"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-violet-500"
              />
              {search && (
                <button
                  onClick={() => onSearchChange?.("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            id="navbar-upload-btn"
            onClick={onUploadClick}
            className="hidden sm:flex h-9 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Document
          </Button>
          <Button
            id="navbar-upload-mobile"
            onClick={onUploadClick}
            size="icon"
            className="sm:hidden h-9 w-9 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
