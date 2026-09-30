"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { resetStore } from "@/lib/store";
import { Button } from "./ui/button";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const activeUserId = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    try {
      const client = getBrowserSupabase();
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const nextUserId = session?.user.id ?? null;
        if (activeUserId.current !== nextUserId) {
          // Clear the old snapshot before React can render another account's children.
          resetStore();
          activeUserId.current = nextUserId;
        }
        setUserId(nextUserId);
        setIsLoading(false);
      });
      return () => data.subscription.unsubscribe();
    } catch {
      queueMicrotask(() => {
        setIsConfigured(false);
        setIsLoading(false);
        setError("Supabase is not configured. Follow the setup instructions in README.md.");
      });
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email")).trim().toLowerCase();
    const password = String(fields.get("password"));
    setIsSubmitting(true);
    setError("");
    try {
      const client = getBrowserSupabase();
      if (isRegistering) {
        const { data, error } = await client.auth.signUp({
          email, password, options: { data: { name: String(fields.get("name")).trim() } },
        });
        if (error) throw error;
        if (!data.session) throw new Error("Registration did not create a session. The administrator must disable Confirm email in Supabase Auth settings.");
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Could not sign in. Check your email and password.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <div className="app-loading" role="status">Loading your account...</div>;
  if (userId) return <Fragment key={userId}>{children}</Fragment>;
  return (
    <main className="auth-page">
      <section className="settings-card auth-card">
        <h1>minute<span className="cyan-text">.</span></h1>
        <h2>{isRegistering ? "Create your account" : "Welcome back"}</h2>
        <p>Your conversations and next steps, saved securely.</p>
        <form className="auth-form" onSubmit={(event) => void submit(event)}>
          {isRegistering && <label className="field-label">Your name<input name="name" required maxLength={80} autoComplete="name" /></label>}
          <label className="field-label">Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label className="field-label">Password<input name="password" type="password" required minLength={8} maxLength={72} autoComplete={isRegistering ? "new-password" : "current-password"} /></label>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={isSubmitting || !isConfigured}>{isSubmitting ? "Connecting..." : isRegistering ? "Register" : "Sign in"}</Button>
        </form>
        <Button variant="ghost" disabled={isSubmitting} onClick={() => { setIsRegistering(!isRegistering); setError(""); }}>
          {isRegistering ? "Already have an account? Sign in" : "Create an account"}
        </Button>
        {isRegistering && <p>No email confirmation is required.</p>}
      </section>
    </main>
  );
}
