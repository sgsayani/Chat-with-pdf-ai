"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string; // first letter of name, generated
}

const AUTH_KEY = "chatpdf_user";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = useCallback((email: string, name: string) => {
    const u: AuthUser = { name, email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signup = useCallback((email: string, name: string) => {
    const u: AuthUser = { name, email };
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, signup, logout };
}
