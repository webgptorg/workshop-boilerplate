"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AudioLines,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  Download,
  LayoutDashboard,
  ListTodo,
  Plus,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { useMinute } from "./minute-provider";
import { Avatar } from "./shared";
import { WorkspaceDialog } from "./forms/workspace-dialog";
import { InstallButton } from "./install-button";
import type { Workspace } from "@/lib/types";

export function Sidebar({
  workspace,
  active,
  open,
  onClose,
  onHelp,
}: {
  workspace: Workspace;
  active: string;
  open: boolean;
  onClose: () => void;
  onHelp: () => void;
}) {
  const { state, t } = useMinute();
  const [switching, setSwitching] = useState(false);
  const [creating, setCreating] = useState(false);
  const pending = state.todos.filter((todo) => todo.workspaceId === workspace.id && !todo.completed).length;
  const nav = [
    { key: "overview", label: t("Overview", "Přehled"), icon: LayoutDashboard, path: "" },
    { key: "meetings", label: t("Meetings", "Schůzky"), icon: AudioLines, path: "/meetings" },
    { key: "todos", label: t("Todos", "Úkoly"), icon: ListTodo, path: "/todos" },
  ];
  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label={t("Close navigation", "Zavřít navigaci")} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <Link className="minute-brand" href={`/${workspace.id}`} onClick={onClose} aria-label="Minute">
          <div className="brand-symbol">
            <i />
            <i />
            <i />
            <i />
          </div>
          <span>
            minute<span className="brand-dot">.</span>
          </span>
        </Link>
        <button className="mobile-close icon-button" onClick={onClose} aria-label={t("Close navigation", "Zavřít navigaci")}>
          <X size={20} />
        </button>
        <div className="workspace-selector">
          <button className="workspace-switch" aria-expanded={switching} onClick={() => setSwitching(!switching)}>
            <span className="workspace-monogram">{workspace.name[0]?.toUpperCase()}</span>
            <span>
              <strong>{workspace.name}</strong>
              <small>{t("Personal workspace", "Osobní prostor")}</small>
            </span>
            <ChevronsUpDown size={15} />
          </button>
          {switching && (
            <>
              <button
                className="dismiss-layer"
                onClick={() => setSwitching(false)}
                aria-label={t("Close workspace list", "Zavřít seznam prostorů")}
              />
              <div className="workspace-menu">
                {state.workspaces.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.id}`}
                    onClick={() => {
                      setSwitching(false);
                      onClose();
                    }}
                  >
                    <span className="workspace-monogram">{item.name[0]}</span>
                    <span>{item.name}</span>
                    {item.id === workspace.id && <Check size={16} />}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setSwitching(false);
                    setCreating(true);
                  }}
                >
                  <Plus size={17} />
                  {t("Create workspace", "Vytvořit prostor")}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="nav-label">{t("WORKSPACE", "PRACOVNÍ PROSTOR")}</div>
        <nav className="main-nav" aria-label={t("Workspace navigation", "Navigace prostoru")}>
          {nav.map((item) => (
            <Link key={item.key} href={`/${workspace.id}${item.path}`} className={active === item.key ? "active" : ""} onClick={onClose}>
              <item.icon size={19} strokeWidth={1.7} />
              <span>{item.label}</span>
              {item.key === "todos" && pending > 0 && <span className="nav-count">{pending}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <div className="sidebar-note-icon">
            <Sparkles size={18} />
          </div>
          <h3>
            {t("Less note-taking.", "Méně zapisování.")}
            <br />
            {t("More being there.", "Více přítomnosti.")}
          </h3>
          <p>{t("Your conversations, captured. Your next steps, clear.", "Rozhovory zaznamenané. Další kroky jasné.")}</p>
          <span className="note-wave" aria-hidden="true">
            {Array.from({ length: 27 }, (_, i) => (
              <i key={i} style={{ height: `${6 + Math.sin(i * 0.8) ** 2 * 21}px` }} />
            ))}
          </span>
        </div>
        <div className="sidebar-bottom-links">
          <InstallButton icon={Download} />
          <button onClick={onHelp}>
            <CircleHelp size={18} />
            {t("Help & getting started", "Nápověda a první kroky")}
          </button>
          <Link href={`/${workspace.id}/settings`} onClick={onClose} className={active === "settings" ? "active" : ""}>
            <Settings2 size={18} />
            {t("Settings", "Nastavení")}
          </Link>
        </div>
        <Link className="sidebar-user" href={`/${workspace.id}/settings`} onClick={onClose}>
          <Avatar name={state.user.name} />
          <span>
            <strong>{state.user.name}</strong>
            <small>{t("Personal account", "Osobní účet")}</small>
          </span>
          <ChevronDown size={15} />
        </Link>
      </aside>
      {creating && <WorkspaceDialog onClose={() => setCreating(false)} />}
    </>
  );
}
