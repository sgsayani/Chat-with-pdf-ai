"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    // Simulate a small network delay for realism
    await new Promise((r) => setTimeout(r, 600));

    const err = login(email, password);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col bg-foreground p-10 text-background relative overflow-hidden">
        {/* decorative accent glow */}
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/10 backdrop-blur">
              <FileText className="h-5 w-5 text-background" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">ChatPDF</span>
          </div>

          <h1 className="font-serif text-4xl font-medium leading-tight mb-4">
            Chat with your<br />documents using AI
          </h1>
          <p className="text-background/60 text-lg leading-relaxed mb-10">
            Upload any PDF and start an intelligent conversation. Get instant answers, summaries, and insights.
          </p>

          {/* Feature pills */}
          {["Powered by Google Gemini", "Pinecone vector search", "Real-time streaming answers"].map((f) => (
            <div key={f} className="flex items-center gap-2.5 mb-3">
              <div className="h-5 w-5 rounded-full bg-background/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current text-background">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-background/70">{f}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-background/40 text-xs">© 2026 ChatPDF. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <FileText className="h-4 w-4 text-background" />
          </div>
          <span className="text-xl font-semibold">Chat<span className="text-accent">PDF</span></span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="login-email">
                Email address
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                {error}
              </p>
            )}

            <Button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="h-11 font-medium mt-1"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in…</>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
