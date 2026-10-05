"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { initializeStore, takeStorageError, useAppState, useSyncStatus } from "@/lib/store";
import type { Account } from "@/lib/account-state";
import type { AppState } from "@/lib/types";

interface MinuteContextValue {
  state: AppState;
  t: (english: string, czech: string) => string;
  notify: (message: string) => void;
}

const MinuteContext = createContext<MinuteContextValue | null>(null);

export function MinuteProvider({ children, account }: { children: React.ReactNode; account: Account }) {
  const state = useAppState();
  const SYNC_STATUS = useSyncStatus();
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 6000);
  }, []);

  useEffect(() => {
    void initializeStore(account).catch((reason: Error) => setLoadError(reason.message));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [account]);

  useEffect(() => {
    if (!state) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = state.user.theme === "system" ? (query.matches ? "dark" : "light") : state.user.theme;
      document.documentElement.lang = state.user.language;
    };
    apply();
    query.addEventListener("change", apply);
    const message = takeStorageError();
    if (message) queueMicrotask(() => notify(message));
    return () => query.removeEventListener("change", apply);
  }, [state, notify]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Browser may block service workers. */
      });
    }
  }, []);

  const t = useCallback((english: string, czech: string) => (state?.user.language === "cs" ? czech : english), [state?.user.language]);

  if (loadError) return <main className="auth-page"><section className="settings-card auth-card">
    <h1>Could not load your workspace</h1><p role="alert">{loadError}</p>
    <button className="button button-primary" onClick={() => window.location.reload()}>Retry</button>
  </section></main>;

  if (!state)
    return (
      <div className="app-loading">
        <div className="brand-symbol">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span>
          minute<span className="cyan-text">.</span>
        </span>
      </div>
    );

  return (
    <MinuteContext.Provider value={{ state, t, notify }}>
      {children}
      <div className="sync-status" aria-live="polite">{SYNC_STATUS}</div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button className="icon-button" aria-label={t("Dismiss", "Zavřít")} onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </MinuteContext.Provider>
  );
}

export function useMinute() {
  const context = useContext(MinuteContext);
  if (!context) throw new Error("useMinute must be used within MinuteProvider");
  return context;
}
