"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  name: string;
  email: string;
}

// Registered user record (stored in chatpdf_accounts)
interface StoredAccount {
  name: string;
  email: string;
  password: string; // plain text — acceptable for a localStorage demo; use bcrypt on a real backend
}

const SESSION_KEY = "chatpdf_user";     // currently logged-in user
const ACCOUNTS_KEY = "chatpdf_accounts"; // all registered accounts

function getAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAccount(account: StoredAccount) {
  const accounts = getAccounts().filter((a) => a.email !== account.email);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  /**
   * Returns null on success, or an error string to show the user.
   */
  const login = useCallback((email: string, password: string): string | null => {
    const accounts = getAccounts();
    const match = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (!match) {
      return "Incorrect email or password. Please try again.";
    }

    const u: AuthUser = { name: match.name, email: match.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
    return null; // success
  }, []);

  /**
   * Returns null on success, or an error string (e.g. email already registered).
   */
  const signup = useCallback((email: string, name: string, password: string): string | null => {
    const accounts = getAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return "An account with this email already exists. Please sign in.";
    }

    saveAccount({ name: name.trim(), email: email.toLowerCase(), password });
    const u: AuthUser = { name: name.trim(), email: email.toLowerCase() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
    return null; // success
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, signup, logout };
}
