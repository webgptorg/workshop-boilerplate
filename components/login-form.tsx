"use client";

import { useState } from "react";
import { getSupabase, registerWithoutEmail } from "@/lib/supabase";
import { Button } from "./ui/button";

export function LoginForm({ configurationError }: { configurationError: string }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  return <main className="auth-page">
    <section className="settings-card auth-card">
      <span className="brand-wordmark">minute<span className="cyan-text">.</span></span>
      <h1>{isRegistering ? "Create your account" : "Log in to Minute"}</h1>
      <p>Good conversations. Clear next steps.</p>
      <form className="profile-form" onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");
        const FORM = new FormData(event.currentTarget);
        const EMAIL = String(FORM.get("email")).trim().toLowerCase();
        const PASSWORD = String(FORM.get("password"));
        try {
          const SUPABASE = getSupabase();
          if (isRegistering) {
            await registerWithoutEmail(EMAIL, PASSWORD, String(FORM.get("name")).trim());
          } else {
            const { error: loginError } = await SUPABASE.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
            if (loginError) throw new Error("Incorrect email or password.");
          }
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Could not connect. Please try again.");
        } finally { setIsSubmitting(false); }
      }}>
        {isRegistering && <label className="field-label">Your name<input name="name" autoComplete="name" required maxLength={80} /></label>}
        <label className="field-label">Email<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
        <label className="field-label">Password<input name="password" type="password" autoComplete={isRegistering ? "new-password" : "current-password"} required minLength={isRegistering ? 8 : undefined} maxLength={72} /></label>
        {(error || configurationError) && <p role="alert">{configurationError || error}</p>}
        <Button type="submit" disabled={isSubmitting || !!configurationError}>{isSubmitting ? "Please wait…" : isRegistering ? "Create account" : "Log in"}</Button>
        <Button variant="ghost" disabled={isSubmitting} onClick={() => { setIsRegistering(!isRegistering); setError(""); }}>
          {isRegistering ? "Already have an account? Log in" : "Create an account"}
        </Button>
        {isRegistering && <p className="field-hint">You can start immediately. No confirmation email is sent.</p>}
      </form>
    </section>
  </main>;
}
