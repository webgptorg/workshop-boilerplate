import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronsUpDown,
  CircleHelp,
  Lightbulb,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { USERS, type Role, type View } from "@/lib/meal-model";
const NAVIGATION = [
  { id: "menu", label: "Jídelníček", icon: CalendarDays },
  { id: "feedback", label: "Hodnocení jídel", icon: MessageSquare },
  { id: "ideas", label: "Náměty na jídla", icon: Lightbulb },
  { id: "preferences", label: "Moje preference", icon: Settings2 },
] as const;
export function AppSidebar({
  role,
  view,
  pendingIdeas,
  changeView,
  onHelp,
  onLogin,
}: {
  role: Role;
  view: View;
  pendingIdeas: number;
  changeView: (view: View) => void;
  onHelp: () => void;
  onLogin: () => void;
}) {
  const user = USERS[role];
  const isStaff = role === "staff";
  return (
    <aside className="sidebar">
      <Link className="brand-image" href="/" aria-label="Společný stůl – úvod">
        <Image
          src="/brand.png"
          alt="společný stůl"
          width={235}
          height={108}
          priority
        />
      </Link>
      <div className="school-label">
        <span className="school-icon">
          <Utensils size={16} />
        </span>
        <div>
          <strong>Školní jídelna</strong>
          <span>Ukázková základní škola</span>
        </div>
      </div>
      <div className="nav-caption">PŘEHLED</div>
      <nav aria-label="Hlavní navigace">
        {NAVIGATION.filter((item) => !isStaff || item.id !== "preferences").map(
          (item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => changeView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {isStaff && item.id === "ideas" && pendingIdeas > 0 && (
                <span className="nav-count">{pendingIdeas}</span>
              )}
            </button>
          ),
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="local-note">
          <ShieldCheck size={18} />
          <div>
            <strong>Ukázkový provoz</strong>
            <p>Data zůstávají v tomto prohlížeči.</p>
          </div>
        </div>
        <button className="help-link" onClick={onHelp}>
          <CircleHelp size={18} /> Jak aplikace funguje
        </button>
        <button className="profile-switch" onClick={onLogin}>
          <span className="avatar">{user.initials}</span>
          <span>
            <strong>{user.name}</strong>
            <small>
              {user.label} · {user.detail}
            </small>
          </span>
          <ChevronsUpDown size={16} />
        </button>
      </div>
    </aside>
  );
}
