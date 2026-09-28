"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createUserData, createWorkspace } from "@/lib/minute/sample-data";
import {
  demoUsers,
  type User,
  type UserData,
  type Workspace,
  type Language,
  type ActionItem,
  type Call,
} from "@/lib/minute/types";
import { uid } from "@/lib/minute/utils";
import { Icon } from "./icon";

type MinuteContextValue = {
  user: User | null;
  data: UserData;
  workspace: Workspace | undefined;
  ready: boolean;
  language: Language;
  dark: boolean;
  t: (en: string, cs: string) => string;
  setLanguage: (language: Language) => void;
  setDark: (dark: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  notify: (message: string) => void;
  updateWorkspace: (updater: (workspace: Workspace) => Workspace) => void;
  createNewWorkspace: (name: string) => string;
  updateAction: (id: string, patch: Partial<ActionItem>, log?: string) => void;
  addAction: (title: string, callIds: string[], parentId?: string) => void;
  updateCall: (id: string, patch: Partial<Call>) => void;
};
const MinuteContext = createContext<MinuteContextValue | null>(null);
function readData(user: User): UserData {
  try {
    const raw = localStorage.getItem(`minute:data:${user.id}`);
    if (raw) {
      const data = JSON.parse(raw) as UserData;
      if (Array.isArray(data.workspaces)) return data;
    }
  } catch {
    /* Recover a demo if browser data is malformed. */
  }
  return createUserData();
}
export function MinuteProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(demoUsers[0]);
  const [data, setData] = useState<UserData>(createUserData);
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState<Language>("en");
  const [dark, setDarkState] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  useEffect(() => {
    const restore = () => {
      try {
        const raw = localStorage.getItem("minute:session");
        const currentUser: User | null =
          raw === "signed-out"
            ? null
            : raw
              ? (JSON.parse(raw) as User)
              : demoUsers[0];
        setUser(currentUser);
        if (currentUser) setData(readData(currentUser));
        setLanguageState(
          localStorage.getItem("minute:language") === "cs" ? "cs" : "en",
        );
        setDarkState(localStorage.getItem("minute:theme") === "dark");
      } catch {
        notify("Browser storage is unavailable. Changes may not be saved.");
      }
      setReady(true);
    };
    queueMicrotask(restore);
    const sync = (event: StorageEvent) => {
      if (event.key === "minute:session") restore();
      if (event.key?.startsWith("minute:data:") && event.newValue) {
        try {
          const session = localStorage.getItem("minute:session");
          const active =
            session && session !== "signed-out"
              ? (JSON.parse(session) as User)
              : demoUsers[0];
          if (event.key === `minute:data:${active.id}`)
            setData(JSON.parse(event.newValue) as UserData);
        } catch {
          /* Ignore malformed changes from another tab. */
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [notify]);
  useEffect(() => {
    if (!ready || !user) return;
    try {
      localStorage.setItem(`minute:data:${user.id}`, JSON.stringify(data));
    } catch {
      queueMicrotask(() =>
        notify("Storage is full. Export your notes before closing this page."),
      );
    }
  }, [data, user, ready, notify]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.lang = language;
  }, [dark, language]);
  const workspace = data.workspaces.find((w) => w.id === workspaceId);
  function updateWorkspace(updater: (workspace: Workspace) => Workspace) {
    setData((previous) => ({
      ...previous,
      workspaces: previous.workspaces.map((w) =>
        w.id === workspaceId ? updater(w) : w,
      ),
    }));
  }
  function updateAction(id: string, patch: Partial<ActionItem>, log?: string) {
    updateWorkspace((w) => ({
      ...w,
      actions: w.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              ...patch,
              history: log
                ? [...a.history, { text: log, date: new Date().toISOString() }]
                : a.history,
            }
          : a,
      ),
    }));
  }
  const value: MinuteContextValue = {
    user,
    data,
    workspace,
    ready,
    language,
    dark,
    notify,
    updateWorkspace,
    updateAction,
    t: (en, cs) => (language === "cs" ? cs : en),
    setLanguage: (language) => {
      setLanguageState(language);
      localStorage.setItem("minute:language", language);
    },
    setDark: (dark) => {
      setDarkState(dark);
      localStorage.setItem("minute:theme", dark ? "dark" : "light");
    },
    login: (user) => {
      setUser(user);
      setData(readData(user));
      localStorage.setItem("minute:session", JSON.stringify(user));
    },
    logout: () => {
      setUser(null);
      localStorage.setItem("minute:session", "signed-out");
    },
    createNewWorkspace: (name) => {
      const id = `workspace-${uid().slice(0, 8)}`;
      setData((previous) => ({
        ...previous,
        workspaces: [...previous.workspaces, createWorkspace(id, name)],
      }));
      return id;
    },
    updateCall: (id, patch) =>
      updateWorkspace((w) => ({
        ...w,
        calls: w.calls.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
    addAction: (title, callIds, parentId) => {
      const action: ActionItem = {
        id: uid(),
        title,
        callIds,
        parentId,
        description: "",
        completed: false,
        relatedIds: [],
        dueDate: "",
        assignee: "",
        comments: [],
        history: [{ text: "Created", date: new Date().toISOString() }],
      };
      updateWorkspace((w) => ({ ...w, actions: [...w.actions, action] }));
    },
  };
  return (
    <MinuteContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </MinuteContext.Provider>
  );
}
export function useMinute() {
  const context = useContext(MinuteContext);
  if (!context) throw new Error("MinuteProvider is required");
  return context;
}
