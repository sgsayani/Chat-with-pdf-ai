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
    await new Promise((r) => setTimeout(r, 800));
    signup(email, name.trim());
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-10 text-white relative overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute bottom-20 left-10 h-32 w-32 rounded-full bg-indigo-400/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ChatPDF</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Start chatting with<br />your documents today
          </h1>
          <p className="text-violet-200 text-lg leading-relaxed mb-10">
            Create a free account and unlock AI-powered conversations with any PDF — research papers, contracts, books and more.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Free tier", sublabel: "No credit card needed" },
              { label: "Instant AI", sublabel: "Answers in seconds" },
              { label: "Secure", sublabel: "Your data stays yours" },
              { label: "Any PDF", sublabel: "Up to 50 MB" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="font-semibold text-sm">{f.label}</p>
                <p className="text-violet-200 text-xs mt-0.5">{f.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-violet-300 text-xs">© 2026 ChatPDF. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold"><span className="text-violet-600">Chat</span>PDF</span>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground mb-1">Create your account</h2>
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
              <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-sm mt-1"
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
            <Link href="/login" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
