"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
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
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const err = signup(email, name.trim(), password);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col bg-foreground p-10 text-background relative overflow-hidden">
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
            Start chatting with<br />your documents today
          </h1>
          <p className="text-background/60 text-lg leading-relaxed mb-10">
            Create a free account and unlock AI-powered conversations with any PDF — research papers, contracts, books and more.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Free tier", sublabel: "No credit card needed" },
              { label: "Instant AI", sublabel: "Answers in seconds" },
              { label: "Secure", sublabel: "Your data stays yours" },
              { label: "Any PDF", sublabel: "Up to 50 MB" },
            ].map((f) => (
              <div key={f.label} className="rounded-lg bg-background/5 border border-background/10 p-3">
                <p className="font-semibold text-sm">{f.label}</p>
                <p className="text-background/60 text-xs mt-0.5">{f.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-background/40 text-xs">© 2026 ChatPDF. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <FileText className="h-4 w-4 text-background" />
          </div>
          <span className="text-xl font-semibold">Chat<span className="text-accent">PDF</span></span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-1">Create your account</h2>
          <p className="text-muted-foreground text-sm mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-name">
                Full name
              </label>
              <Input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-email">
                Email address
              </label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-confirm">
                Confirm password
              </label>
              <Input
                id="signup-confirm"
                type={showPw ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                {error}
              </p>
            )}

            <Button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="h-11 font-medium mt-1"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account…</>
              ) : (
                "Create free account"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our{" "}
              <span className="underline cursor-pointer hover:text-foreground">Terms</span> and{" "}
              <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
            </p>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
