"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMinute } from "./provider";
import { Icon } from "./icon";
import { exportData } from "@/lib/minute/utils";
import type { Call } from "@/lib/minute/types";

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close" className="icon-button">
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Avatar({
  name,
  index = 0,
  small = false,
}: {
  name: string;
  index?: number;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar avatar-${index % 4} ${small ? "avatar-small" : ""}`}
      title={name || "Unassigned"}
    >
      {name ? (name.startsWith("+") ? name : name[0]) : "?"}
    </span>
  );
}
export function EmptyState({
  title,
  icon = "calls",
  children,
}: {
  title: string;
  icon?: "calls" | "check" | "search";
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function ExportMenu({
  call,
  actionsOnly = false,
}: {
  call?: Call;
  actionsOnly?: boolean;
}) {
  const { workspace, t, notify } = useMinute();
  const [open, setOpen] = useState(false);
  return (
    <div className="dropdown-wrap">
      <button
        className="button button-secondary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Icon name="download" size={16} />
        {t("Export", "Exportovat")}
        <Icon name="chevron" size={13} className="rotate-90" />
      </button>
      {open && (
        <>
          <button
            className="menu-dismiss"
            aria-label="Close export menu"
            onClick={() => setOpen(false)}
          />
          <div className="dropdown export-menu">
            {(["md", "csv", "pdf"] as const).map((format) => (
              <button
                key={format}
                onClick={() => {
                  if (workspace) {
                    try {
                      exportData(workspace, format, call, actionsOnly);
                    } catch (error) {
                      notify(
                        error instanceof Error
                          ? error.message
                          : "Export failed",
                      );
                    }
                  }
                  setOpen(false);
                }}
              >
                <Icon name="file" size={17} />
                {format === "md"
                  ? "Markdown (.md)"
                  : format === "csv"
                    ? "CSV (.csv)"
                    : t("Print / Save as PDF", "Tisk / Uložit jako PDF")}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export function Notes({ text }: { text: string }) {
  return (
    <div className="notes-content">
      {text.split("\n").map((line, i) =>
        line.startsWith("## ") ? (
          <h3 key={i}>{line.slice(3)}</h3>
        ) : line.startsWith("- ") ? (
          <div key={i} className="note-bullet">
            <span>•</span>
            {line.slice(2)}
          </div>
        ) : line.trim() ? (
          <p key={i}>{line}</p>
        ) : null,
      )}
    </div>
  );
}

// A browser-local date avoids stale static HTML and server timezone mismatches.
function subscribeToDate(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}
export function Today() {
  const { language } = useMinute();
  const date = useSyncExternalStore(
    subscribeToDate,
    () =>
      new Date().toLocaleDateString(language === "cs" ? "cs-CZ" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    () => "—",
  );
  return <>{date}</>;
}
