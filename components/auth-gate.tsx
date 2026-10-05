"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { resetStore } from "@/lib/store";
import { LoginForm } from "./login-form";
import { MinuteProvider } from "./minute-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const previousAccountId = useRef<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const SUPABASE = getSupabase();
      const { data: { subscription } } = SUPABASE.auth.onAuthStateChange((_event, nextSession) => {
        if (!nextSession || (previousAccountId.current && previousAccountId.current !== nextSession.user.id)) resetStore();
        previousAccountId.current = nextSession?.user.id || null;
        setSession(nextSession);
        setIsLoading(false);
      });
      return () => subscription.unsubscribe();
    } catch (reason) {
      queueMicrotask(() => {
        setError(reason instanceof Error ? reason.message : "Could not connect to Supabase.");
        setIsLoading(false);
      });
    }
  }, []);
  const ACCOUNT_ID = session?.user.id;
  const ACCOUNT_EMAIL = session?.user.email || "";
  const ACCOUNT_NAME = String(session?.user.user_metadata.name || "");
  const ACCOUNT = useMemo(() => ACCOUNT_ID ? {
    id: ACCOUNT_ID, email: ACCOUNT_EMAIL, name: ACCOUNT_NAME,
  } : null, [ACCOUNT_ID, ACCOUNT_EMAIL, ACCOUNT_NAME]);
  if (isLoading) return <div className="app-loading">Loading Minute…</div>;
  if (!session || !ACCOUNT) return <LoginForm configurationError={error} />;
  return <MinuteProvider key={session.user.id} account={ACCOUNT}>{children}</MinuteProvider>;
}
