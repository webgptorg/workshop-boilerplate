"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshStore, signOut } from "@/lib/store";
import { Button } from "./ui/button";

export function AuthScreen({ error }: { error?: string }) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    try {
      const supabase = createClient();
      if (isSigningUp) {
        const language = navigator.languages?.some((value) => /^cs(?:-|$)/i.test(value)) ? "cs" : "en";
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name, language } } });
        if (signUpError) throw signUpError;
        if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
        else await refreshStore();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        await refreshStore();
      }
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={(event) => { void submit(event); }}>
        <span className="auth-brand">minute<span className="cyan-text">.</span></span>
        <h1>{isSigningUp ? "Create your account" : "Welcome back"}</h1>
        <p>Your meetings and todos, saved to your account.</p>
        {isSigningUp && <label className="field-label">Name<input name="name" required maxLength={80} autoComplete="name" /></label>}
        <label className="field-label">Email<input name="email" type="email" required autoComplete="email" /></label>
        <label className="field-label">Password<input name="password" type="password" required minLength={6} autoComplete={isSigningUp ? "new-password" : "current-password"} /></label>
        {(message || error) && <p role="alert" className="auth-message">{message || error}</p>}
        {error && <Button type="button" variant="secondary" onClick={() => window.location.reload()}>Reload saved data</Button>}
        {error && <button type="button" className="auth-switch" onClick={() => { void signOut().catch((caught: unknown) => setMessage(caught instanceof Error ? caught.message : "Sign out failed.")); }}>Sign out</button>}
        <Button type="submit" disabled={isBusy}>{isBusy ? "Please wait…" : isSigningUp ? "Create account" : "Sign in"}</Button>
        <button type="button" className="auth-switch" onClick={() => { setIsSigningUp(!isSigningUp); setMessage(""); }}>
          {isSigningUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </main>
  );
}
