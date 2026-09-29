"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { hasUnsavedChanges, saveChanges, useAppState } from "@/lib/store";
import { SaveStatus } from "./save-status";
import type { AppState } from "@/lib/types";

interface MinuteContextValue {
  state: AppState;
  t: (english: string, czech: string) => string;
  notify: (message: string) => void;
}

const MinuteContext = createContext<MinuteContextValue | null>(null);

export function MinuteProvider({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 6000);
  }, []);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) { event.preventDefault(); event.returnValue = ""; }
    };
    const retrySave = () => { void saveChanges(); };
    window.addEventListener("beforeunload", warnBeforeUnload);
    window.addEventListener("online", retrySave);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      window.removeEventListener("online", retrySave);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = state.user.theme === "system" ? (query.matches ? "dark" : "light") : state.user.theme;
      document.documentElement.lang = state.user.language;
    };
    apply();
    query.addEventListener("change", apply);
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
      <SaveStatus />
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
