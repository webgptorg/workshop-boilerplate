"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { initializeStore, readStorageError, takeStorageError, useAppState, useStoreStatus } from "@/lib/store";
import { AuthScreen } from "./auth-screen";
import type { AppState } from "@/lib/types";

interface MinuteContextValue {
  state: AppState;
  t: (english: string, czech: string) => string;
  notify: (message: string) => void;
}

const MinuteContext = createContext<MinuteContextValue | null>(null);

export function MinuteProvider({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const status = useStoreStatus();
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 6000);
  }, []);

  useEffect(() => {
    initializeStore();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!state || status !== "ready") return;
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
  }, [state, status, notify]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Browser may block service workers. */
      });
    }
  }, []);

  const t = useCallback((english: string, czech: string) => (state?.user.language === "cs" ? czech : english), [state?.user.language]);

  if (status === "signed-out" || status === "error") return <AuthScreen error={status === "error" ? readStorageError() : undefined} />;

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
