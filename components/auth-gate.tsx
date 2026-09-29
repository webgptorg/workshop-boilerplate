"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "@/lib/supabase/browser";
import { initializeStore, resetStore } from "@/lib/store";
import { Button } from "./ui/button";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isActive = true;
    let accountId: string | null = null;
    let generation = 0;
    try {
      const client = browserSupabase();
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const nextId = session?.user.id ?? null;
        if (accountId === nextId && nextId) return;
        accountId = nextId;
        const currentGeneration = ++generation;
        resetStore();
        setIsReady(false);
        setIsAuthenticated(Boolean(nextId));
        setError("");
        if (!nextId) { setIsLoading(false); return; }
        setIsLoading(true);
        // Leave the Auth callback before calling APIs that acquire the session lock.
        window.setTimeout(() => {
          if (!isActive || currentGeneration !== generation) return;
          initializeStore(nextId).then(() => {
            if (isActive && currentGeneration === generation) setIsReady(true);
          }).catch((reason: unknown) => {
            if (isActive && currentGeneration === generation) setError(reason instanceof Error ? reason.message : "Could not load your account.");
          }).finally(() => {
            if (isActive && currentGeneration === generation) setIsLoading(false);
          });
        }, 0);
      });
      return () => { isActive = false; data.subscription.unsubscribe(); resetStore(); };
    } catch (reason) {
      queueMicrotask(() => {
        if (isActive) { setError(reason instanceof Error ? reason.message : "Authentication is not configured."); setIsLoading(false); }
      });
    }
    return () => { isActive = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const credentials = { email: String(form.get("email")).trim().toLowerCase(), password: String(form.get("password")) };
    try {
      const client = browserSupabase();
      const result = isRegistering ? await client.auth.signUp(credentials) : await client.auth.signInWithPassword(credentials);
      if (result.error) throw result.error;
      if (isRegistering && !result.data.session) {
        setError("Registration did not create a session. Ask the administrator to check that email confirmation is disabled.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed. Please try again.");
    } finally { setIsSubmitting(false); }
  }

  if (isReady) return children;
  return (
    <main className="auth-page">
      <section className="settings-card auth-card">
        <h1>minute<span className="cyan-text">.</span></h1>
        <p>{isLoading ? "Loading your account…" : isAuthenticated ? "Your account could not be loaded" : isRegistering ? "Create your account" : "Sign in to your account"}</p>
        {error && <p role="alert">{error}</p>}
        {!isLoading && !isAuthenticated && <form className="auth-form" onSubmit={submit}>
          <label className="field-label">Email<input type="email" name="email" autoComplete="email" required maxLength={254} /></label>
          <label className="field-label">Password<input type="password" name="password" autoComplete={isRegistering ? "new-password" : "current-password"} required minLength={isRegistering ? 8 : 1} maxLength={128} /></label>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : isRegistering ? "Register" : "Sign in"}</Button>
          <Button variant="ghost" disabled={isSubmitting} onClick={() => { setIsRegistering(!isRegistering); setError(""); }}>
            {isRegistering ? "Already have an account? Sign in" : "Create an account"}
          </Button>
          {isRegistering && <p className="field-hint">No confirmation email is required.</p>}
        </form>}
        {!isLoading && isAuthenticated && <Button onClick={() => window.location.reload()}>Retry</Button>}
      </section>
    </main>
  );
}
