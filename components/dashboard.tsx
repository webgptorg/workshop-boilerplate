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
  const IS_STAFF = ROLE === "staff";
  async function save(body: Record<string, unknown>): Promise<boolean> {
    if (!data.user && body.action !== "login") {
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
  ];
  return (
    <div className={`app-shell role-${ROLE}`}>
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
          <button
            className="role-switch"
            onClick={() => {
              setError("");
              setIsLoginOpen(true);
            }}
          >
            <span className="role-dot" />
            {ROLE_LABELS[ROLE]}
            <Users size={16} />
          </button>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="role-dot" />
                {IS_STAFF
                  ? "SPRÁVA JÍDELNY"
                  : ROLE === "parent"
                    ? "ADAM NOVÁK · 6. B"
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
          <LoginForm onSave={save} isPending={isPending} />
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
