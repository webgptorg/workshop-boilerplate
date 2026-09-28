"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Command, Home, Menu, Moon, Search, Sun } from "lucide-react";
import { useMinute } from "./minute-provider";
import { Sidebar } from "./sidebar";
import { Avatar } from "./shared";
import { Dashboard } from "./dashboard";
import { MeetingsView } from "./meetings-view";
import { TodosView } from "./todos-view";
import { MeetingDetail } from "./meeting-detail";
import { MeetingStudio } from "./meeting-studio";
import { TodoDetail } from "./todo-detail";
import { SettingsView } from "./settings-view";
import { MeetingDialog } from "./forms/meeting-dialog";
import { TodoDialog } from "./forms/todo-dialog";
import { HelpDialog } from "./help-dialog";
import { SearchDialog } from "./search-dialog";
import { mutate } from "@/lib/store";
import { createMeeting } from "@/lib/meeting";
import { requestRecordingStart } from "@/lib/recording-intent";
import { locale } from "@/lib/utils";
import type { Language, Meeting } from "@/lib/types";

export function AppShell({ path: serverPath }: { path: string[] }) {
  // The cached app shell also serves unvisited deep links while offline.
  const pathname = usePathname();
  const router = useRouter();
  const path = pathname ? pathname.split("/").filter(Boolean) : serverPath;
  const { state, t } = useMinute();
  const [navOpen, setNavOpen] = useState(false);
  const [dialog, setDialog] = useState<"meeting" | "schedule" | "todo" | "search" | "help" | null>(null);
  const workspaceId = path[0] ?? state.workspaces[0].id;
  const workspace = state.workspaces.find((item) => item.id === workspaceId);
  const section = path[1] ?? "overview";
  const meeting =
    section === "meetings" && path[2] ? state.meetings.find((item) => item.id === path[2] && item.workspaceId === workspaceId) : undefined;
  const todo =
    section === "todos" && path[2] ? state.todos.find((item) => item.id === path[2] && item.workspaceId === workspaceId) : undefined;
  const titles: Record<string, string> = {
    overview: t("Overview", "Přehled"),
    meetings: t("Meetings", "Schůzky"),
    todos: t("Todos", "Úkoly"),
    settings: t("Settings", "Nastavení"),
  };
  const validRoute =
    !!workspace &&
    !!titles[section] &&
    (path.length < 3 || (!!meeting && (path.length === 3 || (path.length === 4 && path[3] === "studio"))) || (!!todo && path.length === 3));
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setDialog("search");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    document.title = `${meeting?.title ?? todo?.title ?? titles[section] ?? "Minute"} · Minute`;
  });
  const current = workspace ?? state.workspaces[0];
  const newMeeting = (scheduled = false) => setDialog(scheduled ? "schedule" : "meeting");
  const startRecording = () => {
    const DATE = new Date();
    const NEXT: Meeting = {
      ...createMeeting(current, state.user.name, DATE),
      title: `${t("Meeting", "Schůzka")} · ${DATE.toLocaleString(locale(state.user.language), { dateStyle: "medium", timeStyle: "short" })}`,
      status: "in-progress",
    };
    mutate((existing) => ({ ...existing, meetings: [NEXT, ...existing.meetings] }));
    requestRecordingStart(NEXT.id);
    router.push(`/${current.id}/meetings/${NEXT.id}/studio`);
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t("Skip to content", "Přejít na obsah")}
      </a>
      <Sidebar workspace={current} active={section} open={navOpen} onClose={() => setNavOpen(false)} onHelp={() => setDialog("help")} />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              onClick={() => setNavOpen(true)}
              aria-label={t("Open navigation", "Otevřít navigaci")}
            >
              <Menu size={21} />
            </button>
            <Link href={`/${current.id}`} className="breadcrumb-home" aria-label={t("Workspace home", "Úvod prostoru")}>
              <Home size={15} />
            </Link>
            <span className="breadcrumb-workspace">{current.name}</span>
            <ChevronRight size={13} />
            <Link href={`/${current.id}${section === "overview" ? "" : `/${section}`}`}>
              {titles[section] ?? t("Not found", "Nenalezeno")}
            </Link>
            {meeting && (
              <>
                <ChevronRight size={13} />
                <span className="breadcrumb-detail">{path[3] === "studio" ? t("Studio", "Studio") : meeting.title}</span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <button className="global-search" aria-label={t("Search workspace", "Prohledat prostor")} onClick={() => setDialog("search")}>
              <Search size={16} />
              <span>{t("Search anything…", "Hledat cokoli…")}</span>
              <kbd>
                <Command size={10} /> K
              </kbd>
            </button>
            <div className="topbar-divider" />
            <button
              className="icon-button theme-toggle"
              aria-label={t("Toggle color theme", "Přepnout barevný režim")}
              onClick={() =>
                mutate((current) => ({
                  ...current,
                  user: { ...current.user, theme: document.documentElement.dataset.theme === "dark" ? "light" : "dark" },
                }))
              }
            >
              <Sun className="sun-icon" size={18} />
              <Moon className="moon-icon" size={18} />
            </button>
            <select
              className="topbar-language"
              aria-label={t("App language", "Jazyk aplikace")}
              value={state.user.language}
              onChange={(e) => mutate((current) => ({ ...current, user: { ...current.user, language: e.target.value as Language } }))}
            >
              <option value="en">EN</option>
              <option value="cs">CS</option>
            </select>
            <Link href={`/${current.id}/settings`} aria-label={t("Your profile", "Váš profil")}>
              <Avatar name={state.user.name} small />
            </Link>
          </div>
        </header>
        <main id="main-content" className="page-content" key={path.join("/")}>
          {!validRoute ? (
            <div className="not-found">
              <span>404</span>
              <h1>{t("This page wandered off.", "Tato stránka se zatoulala.")}</h1>
              <p>
                {t(
                  "This link may belong to another browser, or the item was deleted.",
                  "Tento odkaz může patřit jinému prohlížeči nebo byla položka smazána.",
                )}
              </p>
              <Link className="button button-primary" href={`/${current.id}`}>
                {t("Back to workspace", "Zpět do prostoru")}
              </Link>
            </div>
          ) : section === "overview" ? (
            <Dashboard
              workspace={current}
              onNewMeeting={newMeeting}
              onStartRecording={startRecording}
              onNewTodo={() => setDialog("todo")}
              onHelp={() => setDialog("help")}
            />
          ) : section === "meetings" ? (
            meeting ? (
              path[3] === "studio" ? (
                <MeetingStudio meeting={meeting} />
              ) : (
                <MeetingDetail meeting={meeting} workspace={current} />
              )
            ) : (
              <MeetingsView workspaceId={current.id} onNewMeeting={newMeeting} />
            )
          ) : section === "todos" ? (
            todo ? (
              <TodoDetail todo={todo} />
            ) : (
              <TodosView workspaceId={current.id} onNewTodo={() => setDialog("todo")} />
            )
          ) : (
            <SettingsView workspace={current} />
          )}
        </main>
      </div>
      {(dialog === "meeting" || dialog === "schedule") && (
        <MeetingDialog workspace={current} scheduled={dialog === "schedule"} onClose={() => setDialog(null)} />
      )}
      {dialog === "todo" && <TodoDialog workspaceId={current.id} onClose={() => setDialog(null)} />}
      {dialog === "search" && <SearchDialog workspaceId={current.id} onClose={() => setDialog(null)} />}
      {dialog === "help" && <HelpDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
