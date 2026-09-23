import {
  CircleHelp,
  LogOut,
  Sprout,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { AppData } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";
import { Brand } from "./brand";
type SidebarProps = {
  data: AppData;
  view: string;
  navigation: { id: string; label: string; icon: LucideIcon }[];
  onNavigate: (view: string) => void;
  onHelp: () => void;
  onLogin: () => void;
  onLogout: () => void;
};
export function Sidebar({
  data,
  view,
  navigation: NAVIGATION,
  onNavigate,
  onHelp,
  onLogin,
  onLogout,
}: SidebarProps) {
  const ROLE = data.user?.role || "pupil";
  return (
    <aside className="sidebar">
      <Brand />
      <div className="school">
        <div className="school-icon">
          <Utensils size={18} />
        </div>
        <div>
          <strong>Školní jídelna</strong>
          <span>Ukázková škola</span>
        </div>
      </div>
      <nav aria-label="Hlavní navigace">
        {NAVIGATION.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => {
              onNavigate(id);
            }}
            aria-current={view === id ? "page" : undefined}
          >
            <Icon size={19} />
            {label}
            {id === "ideas" &&
              data.ideas.filter((idea) => idea.status === "Čeká na vyřízení")
                .length > 0 && (
                <span className="nav-count">
                  {
                    data.ideas.filter(
                      (idea) => idea.status === "Čeká na vyřízení",
                    ).length
                  }
                </span>
              )}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-plant">
          <Sprout size={31} strokeWidth={1.3} />
          <span>Společný stůl</span>
          <small>Školní rok 2026 / 2027</small>
        </div>
        <button className="help-link" onClick={() => onHelp()}>
          <CircleHelp size={18} /> Jak aplikace funguje
        </button>
        <div className="profile">
          <div className="avatar">
            {data.user
              ? data.user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
              : "AN"}
          </div>
          <button onClick={() => onLogin()}>
            <strong>{data.user?.name || "Ukázkový účet"}</strong>
            <span>{data.user ? ROLE_LABELS[ROLE] : "Přihlásit se"}</span>
          </button>
          {data.user && (
            <button
              className="logout"
              aria-label="Odhlásit se"
              onClick={() => onLogout()}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
