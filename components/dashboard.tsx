"use client";
import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Check,
  Heart,
  Lightbulb,
  MessageSquare,
  Settings2,
  Users,
  ArrowUpRight,
} from "lucide-react";
import type { AppData, Meal } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { WeeklyMenu } from "./weekly-menu";
import { Dialog } from "./dialog";
import { LoginForm, MealForm } from "./forms";
import { Community } from "./community";
import { Button } from "./ui/button";
export function Dashboard({ initialData }: { initialData: AppData }) {
  const [data, setData] = useState(initialData);
  const [view, setView] = useState("menu");
  const [weekIndex, setWeekIndex] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const ROLE = data.user?.role || "pupil";
  const ACTIVE_CANTEEN_ROLES = data.canteens.find((canteen) => canteen.id === data.activeCanteenId)?.roles || data.roles;
  const IS_STAFF = ROLE === "staff" || ROLE === "manager";
  async function save(body: Record<string, unknown>): Promise<boolean> {
    if (!data.user && !["login", "register"].includes(String(body.action))) {
      setIsLoginOpen(true);
      return false;
    }
    setIsPending(true);
    setError("");
    setNotice("");
    try {
      const RESPONSE = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const RESULT = await RESPONSE.json();
      if (!RESPONSE.ok) {
        setError(RESULT.error || "Změna se nepodařila.");
        return false;
      }
      if (body.action === "exportData") {
        const EXPORT_BLOB = new Blob([JSON.stringify(RESULT, null, 2)], { type: "application/json" });
        const DOWNLOAD_URL = URL.createObjectURL(EXPORT_BLOB);
        const DOWNLOAD_LINK = document.createElement("a");
        DOWNLOAD_LINK.href = DOWNLOAD_URL;
        DOWNLOAD_LINK.download = "moje-data-spolecny-stul.json";
        DOWNLOAD_LINK.click();
        URL.revokeObjectURL(DOWNLOAD_URL);
        return true;
      }
      setData(RESULT);
      setActiveMeal(null);
      setIsLoginOpen(false);
      if (body.action === "login" || body.action === "logout") setView("menu");
      setNotice(
        body.action === "login"
          ? "Přihlášení proběhlo úspěšně."
          : body.action === "logout"
            ? "Jste odhlášeni."
            : "Změna byla uložena.",
      );
      return true;
    } catch {
      setError(
        "Spojení se nezdařilo. Zkontrolujte připojení a zkuste změnu znovu.",
      );
      return false;
    } finally {
      setIsPending(false);
    }
  }
  const NAVIGATION = [
    { id: "menu", label: "Jídelníček", icon: CalendarDays },
    { id: "ideas", label: "Náměty na jídla", icon: Lightbulb },
    { id: "feedback", label: "Hodnocení", icon: MessageSquare },
    ...(ROLE === "parent"
      ? [{ id: "preferences", label: "Preference dítěte", icon: Settings2 }]
      : []),
    ...(data.user ? [{ id: "account", label: "Můj účet", icon: Users }] : []),
  ];
  return (
    <div className={`app-shell role-${ROLE === "manager" ? "staff" : ROLE}`}>
      <Sidebar
        data={data}
        view={view}
        navigation={NAVIGATION}
        onNavigate={(value) => {
          setView(value);
          setNotice("");
        }}
        onHelp={() => setIsHelpOpen(true)}
        onLogin={() => setIsLoginOpen(true)}
        onLogout={() => void save({ action: "logout" })}
      />
      <div className="workspace">
        <header className="topbar">
          <span>
            <span className="breadcrumb">Školní stravování</span>
            <ChevronRight size={14} />
            {NAVIGATION.find((item) => item.id === view)?.label}
          </span>
          {data.user ? (
            <div className="context-switcher">
              {data.canteens.length > 1 && <select aria-label="Jídelna" value={data.activeCanteenId ?? ""} onChange={(event) => { const NEXT=data.canteens.find((canteen)=>canteen.id===Number(event.target.value)); const NEXT_ROLE=NEXT?.roles[0] || "parent"; void save({ action:"switchContext", canteenId:Number(event.target.value), role:NEXT_ROLE, dinerId:null }); }}>{data.canteens.map((canteen)=><option key={canteen.id} value={canteen.id}>{canteen.name}</option>)}</select>}
              {ACTIVE_CANTEEN_ROLES.length > 1 && <label className="sr-only" htmlFor="active-role">Role</label>}
              {ACTIVE_CANTEEN_ROLES.length > 1 && <select id="active-role" aria-label="Role" value={ROLE} onChange={(event) => { const NEXT_ROLE=event.target.value; void save({ action: "switchContext", role: NEXT_ROLE, dinerId: ["parent","pupil","adult"].includes(NEXT_ROLE) ? data.activeDinerId ?? data.diners[0]?.id ?? null : null }); }}>{ACTIVE_CANTEEN_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select>}
              {(["parent","pupil","adult"].includes(ROLE)) && data.diners.length > 1 && <select aria-label="Vybraný strávník" value={data.activeDinerId ?? ""} onChange={(event) => void save({ action: "switchContext", role: ROLE, dinerId: Number(event.target.value) })}>{data.diners.map((diner) => <option key={diner.id} value={diner.id}>{diner.name}{diner.className ? ` · ${diner.className}` : ""}</option>)}</select>}
              <span className="role-switch"><span className="role-dot" />{ROLE_LABELS[ROLE]}<Users size={16} /></span>
            </div>
          ) : <button className="role-switch" onClick={() => setIsLoginOpen(true)}><span className="role-dot" />Přihlásit se<Users size={16} /></button>}
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="role-dot" />
                {IS_STAFF
                  ? "SPRÁVA JÍDELNY"
                  : ROLE === "parent"
                    ? `${data.diners.find((diner) => diner.id === data.activeDinerId)?.name || "STRÁVNÍK"}${data.diners.find((diner) => diner.id === data.activeDinerId)?.className ? ` · ${data.diners.find((diner) => diner.id === data.activeDinerId)?.className}` : ""}`
                    : "ŠKOLNÍ JÍDELNA"}
              </div>
              <h1>
                {view === "menu"
                  ? "Týdenní jídelníček"
                  : NAVIGATION.find((item) => item.id === view)?.label}
              </h1>
            </div>
            {view === "menu" && (
              <Button variant="secondary" onClick={() => setView("ideas")}>
                <Lightbulb size={16} />
                {IS_STAFF ? "Vyřídit náměty" : "Navrhnout jídlo"}
                <ArrowUpRight size={15} />
              </Button>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              <Check size={16} />
              {notice}
              <button aria-label="Skrýt zprávu" onClick={() => setNotice("")}>
                ×
              </button>
            </div>
          )}
          {error && !isLoginOpen && !activeMeal && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          {view === "menu" ? (
            <>
              <WeeklyMenu
                data={data}
                weekIndex={weekIndex}
                setWeekIndex={setWeekIndex}
                isPending={isPending}
                save={save}
                onDetail={(meal) => {
                  setError("");
                  setActiveMeal(meal);
                }}
              />
            </>
          ) : (
            <Community
              data={data}
              view={view}
              onSave={save}
              isPending={isPending}
            />
          )}
          <footer>
            <span>© 2026 Společný stůl</span>
            <span>
              <Heart size={12} /> Ukázkový provoz · data se ukládají
            </span>
          </footer>
        </main>
      </div>
      {isLoginOpen && (
        <Dialog
          title="Přihlášení"
          onClose={() => {
            setIsLoginOpen(false);
            setError("");
          }}
        >
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <LoginForm onSave={save} isPending={isPending} isDemoMode={data.isDemoMode} />
        </Dialog>
      )}
      {activeMeal && (
        <Dialog
          title={IS_STAFF ? "Upravit jídlo" : "Detail a hodnocení"}
          onClose={() => {
            setActiveMeal(null);
            setError("");
          }}
        >
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <MealForm
            meal={activeMeal}
            role={ROLE}
            onSave={save}
            isPending={isPending}
          />
        </Dialog>
      )}
      {isHelpOpen && (
        <Dialog
          title="Jak aplikace funguje"
          onClose={() => setIsHelpOpen(false)}
        >
          <div className="help-content">
            <p>
              <strong>Žák</strong> vybírá jeden ze dvou obědů a hodnotí jídla.
            </p>
            <p>
              <strong>Rodič</strong> sdílí výběr dítěte, spravuje preference a
              posílá náměty.
            </p>
            <p>
              <strong>Jídelna</strong> upravuje nabídku, čte hodnocení a
              odpovídá na náměty.
            </p>
            <p>
              Ukázkové účty vyberete tlačítkem role v pravém horním rohu. Změny
              zůstávají uložené i po obnovení stránky.
            </p>
            <p>
              Jídelníček je inspirovaný dodanými podklady. Receptury a alergeny
              vyžadují ověření jídelnou. Aplikace zatím nepočítá spotřební koš
              ani neposílá objednávky do iCanteen.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
