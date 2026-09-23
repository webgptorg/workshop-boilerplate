"use client";
import { useState } from "react";
import { Check, ChevronRight, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INITIAL_WEEK, USERS, type Role, type View } from "@/lib/meal-model";
import { useMealStore } from "@/lib/use-meal-store";
import { AppSidebar } from "./app-sidebar";
import { MenuView, type ActiveDialog } from "./menu-view";
import {
  EditMealDialog,
  FeedbackDialog,
  LoginDialog,
  MealDetail,
} from "./meal-dialogs";
import {
  FeedbackView,
  IdeaForm,
  IdeasView,
  PreferencesView,
} from "./community-views";
import { Modal } from "./modal";

const VIEW_TITLES: Record<View, string> = {
  menu: "Týdenní jídelníček",
  feedback: "Hodnocení jídel",
  ideas: "Náměty na jídla",
  preferences: "Stravovací preference",
};

export function MealApp() {
  const { data, updateData, isLoaded, storageMessage } = useMealStore();
  const [role, setRole] = useState<Role>("pupil");
  const [view, setView] = useState<View>("menu");
  const [weekIndex, setWeekIndex] = useState(INITIAL_WEEK);
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [notification, setNotification] = useState("");
  const isStaff = role === "staff";
  const user = USERS[role];
  const pendingIdeas = data.ideas.filter(
    (idea) => idea.status === "pending",
  ).length;
  function addIdea(text: string) {
    updateData((current) => ({
      ...current,
      ideas: [
        {
          id: crypto.randomUUID(),
          text,
          role,
          status: "pending",
          response: "",
        },
        ...current.ideas,
      ],
    }));
    setDialog(null);
    setNotification("Námět byl uložen. Odpověď najdete v Námětech na jídla.");
  }
  function selectMeal(date: string, mealId: string) {
    updateData((current) => ({
      ...current,
      choices: {
        ...current.choices,
        [date]: current.choices[date] === mealId ? "" : mealId,
      },
    }));
  }
  function changeView(nextView: View) {
    setView(nextView);
    setNotification("");
  }
  return (
    <div className={`app-shell theme-${role}`}>
      <AppSidebar
        role={role}
        view={view}
        pendingIdeas={pendingIdeas}
        changeView={changeView}
        onHelp={() => setDialog({ kind: "help" })}
        onLogin={() => setDialog({ kind: "login" })}
      />
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Moje jídelna <ChevronRight size={14} />
            <strong>{VIEW_TITLES[view]}</strong>
          </div>
          <div className="topbar-right">
            <span className="role-pill">
              <span />
              {user.label}
            </span>
            <button
              className="top-avatar"
              onClick={() => setDialog({ kind: "login" })}
              aria-label="Přepnout uživatele"
            >
              {user.initials}
            </button>
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {isStaff
                  ? "PLÁNOVÁNÍ STRAVOVÁNÍ"
                  : role === "parent"
                    ? "MATĚJ NOVÁK · 6. B"
                    : "MOJE STRAVOVÁNÍ"}
              </div>
              <h1>{VIEW_TITLES[view]}</h1>
              <p>
                {view === "menu"
                  ? isStaff
                    ? "Upravujte nabídku a sledujte, co strávníkům chutná."
                    : role === "parent"
                      ? "Prohlédněte si nabídku a vyberte obědy pro Matěje."
                      : "Prohlédni si nabídku a vyber si, na co máš chuť."
                  : view === "ideas"
                    ? "Nápady od strávníků a odpovědi jídelny na jednom místě."
                    : view === "feedback"
                      ? "Konkrétní zpětná vazba pomáhá jídelně při dalším plánování."
                      : "Přání a zvyklosti vašeho dítěte."}
              </p>
            </div>
            {view === "menu" && (
              <Button
                variant="secondary"
                className="print-button"
                onClick={() => window.print()}
              >
                <Download size={16} /> Vytisknout jídelníček
              </Button>
            )}
          </div>
          {storageMessage && (
            <div className="notice error" role="alert">
              {storageMessage}
            </div>
          )}
          {notification && (
            <div className="notification" role="status">
              <Check size={17} />
              {notification}
              <button
                aria-label="Zavřít oznámení"
                onClick={() => setNotification("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {view === "menu" ? (
            <MenuView
              data={data}
              role={role}
              weekIndex={weekIndex}
              setWeekIndex={setWeekIndex}
              isLoaded={isLoaded}
              setDialog={setDialog}
              changeView={changeView}
              selectMeal={selectMeal}
            />
          ) : view === "feedback" ? (
            <FeedbackView data={data} role={role} />
          ) : view === "ideas" ? (
            <IdeasView
              data={data}
              role={role}
              onAdd={addIdea}
              updateData={updateData}
            />
          ) : (
            <PreferencesView
              key={role}
              data={data}
              updateData={(update) => {
                updateData(update);
                setNotification("Preference Matěje byly uloženy.");
              }}
            />
          )}
          <footer className="page-footer">
            <span>
              společný stůl <span>·</span> Školní stravování
            </span>
            <span>Ukázková data · září–říjen 2026</span>
          </footer>
        </main>
      </div>
      {dialog?.kind === "login" && (
        <LoginDialog
          onClose={() => setDialog(null)}
          onLogin={(nextRole) => {
            setRole(nextRole);
            setView("menu");
            setDialog(null);
            setNotification("");
          }}
        />
      )}
      {dialog?.kind === "detail" && (
        <MealDetail meal={dialog.meal} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "feedback" && (
        <FeedbackDialog
          meal={dialog.meal}
          previous={data.feedback.find(
            (entry) => entry.mealId === dialog.meal.id && entry.role === role,
          )}
          onClose={() => setDialog(null)}
          onSave={(rating, comment) => {
            updateData((current) => ({
              ...current,
              feedback: [
                ...current.feedback.filter(
                  (entry) =>
                    entry.mealId !== dialog.meal.id || entry.role !== role,
                ),
                {
                  id: crypto.randomUUID(),
                  mealId: dialog.meal.id,
                  mealName: dialog.meal.name,
                  role,
                  rating,
                  comment,
                },
              ],
            }));
            setDialog(null);
            setNotification(
              "Děkujeme, hodnocení je uložené a jídelna ho uvidí.",
            );
          }}
        />
      )}
      {dialog?.kind === "edit" && isStaff && (
        <EditMealDialog
          meal={dialog.meal}
          soup={data.days.find((day) => day.date === dialog.date)?.soup ?? ""}
          onClose={() => setDialog(null)}
          onSave={(meal, soup) => {
            updateData((current) => ({
              ...current,
              days: current.days.map((day) =>
                day.date === dialog.date
                  ? {
                      ...day,
                      soup,
                      meals: day.meals.map((item) =>
                        item.id === meal.id ? meal : item,
                      ),
                    }
                  : day,
              ),
            }));
            setDialog(null);
            setNotification("Změny jídelníčku jsou uložené.");
          }}
        />
      )}
      {dialog?.kind === "idea" && (
        <Modal title="Námět na jídlo" onClose={() => setDialog(null)}>
          <p className="muted">
            Napište, co byste rádi ochutnali. O zařazení rozhodne jídelna.
          </p>
          <IdeaForm onSubmit={addIdea} />
        </Modal>
      )}
      {dialog?.kind === "help" && (
        <Modal title="O aplikaci Společný stůl" onClose={() => setDialog(null)}>
          <h3>Jeden jídelníček, tři pohledy</h3>
          <p>
            Žák vybírá a hodnotí obědy. Rodič spravuje stejné volby dítěte a
            jeho preference. Jídelna upravuje nabídku a odpovídá na náměty.
          </p>
          <h3>Ukázkové prostředí</h3>
          <p>
            Účet změníte kliknutím na profil. Přihlášení slouží jen k vyzkoušení
            rolí. Data se ukládají lokálně; nejsou odesílána škole ani do
            objednávkového systému iCanteen.
          </p>
          <h3>Jídelníčky a alergeny</h3>
          <p>
            Nabídka vychází ze šesti týdnů jídelníčků v podkladech projektu.
            Alergeny hlavních jídel jsou převzaté z těchto záznamů a jídelna je
            může upravit. Alternativa nemusí vyhovovat konkrétní dietě.
          </p>
          <h3>Spotřební koš</h3>
          <p>
            Podklady obsahují vyhlášku ve znění k 1. 9. 2025, starší znění a
            metodiky SZÚ. Tato verze neprovádí právní ani nutriční kontrolu. Pro
            výpočet chybí receptury, čisté gramáže, skutečné počty porcí, ceny a
            měsíční evidence.
          </p>
        </Modal>
      )}
    </div>
  );
}
