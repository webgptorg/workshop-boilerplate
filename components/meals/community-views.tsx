"use client";
import { useState } from "react";
import { Lightbulb, MessageSquare, Star, Check, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USERS, type AppData, type Idea, type Role } from "@/lib/meal-model";

type UpdateData = (update: (current: AppData) => AppData) => void;
export function IdeaForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const text = String(
          new FormData(event.currentTarget).get("idea"),
        ).trim();
        if (!text) return;
        onSubmit(text);
        event.currentTarget.reset();
      }}
    >
      <label htmlFor="idea-text">Jaké jídlo byste chtěli v jídelníčku?</label>
      <textarea
        id="idea-text"
        name="idea"
        maxLength={600}
        required
        placeholder="Třeba špagety s rajčatovou omáčkou…"
      />
      <Button type="submit">
        <Lightbulb size={16} /> Poslat námět
      </Button>
    </form>
  );
}
function IdeaReview({
  onSave,
}: {
  onSave: (status: Idea["status"], response: string) => void;
}) {
  const [isDeclined, setIsDeclined] = useState(false);
  return (
    <form
      className="review-form"
      onSubmit={(event) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const response = String(fields.get("response")).trim();
        const alternative = String(fields.get("alternative")).trim();
        if (!response || (fields.get("status") === "declined" && !alternative))
          return;
        onSave(
          fields.get("status") === "accepted" ? "accepted" : "declined",
          response + (alternative ? ` Alternativa: ${alternative}` : ""),
        );
      }}
    >
      <label>
        Rozhodnutí
        <select
          name="status"
          onChange={(event) => setIsDeclined(event.target.value === "declined")}
        >
          <option value="accepted">Přijmout k plánování</option>
          <option value="declined">Navrhnout jinou variantu</option>
        </select>
      </label>
      <label>
        Vysvětlení pro autora
        <textarea
          name="response"
          required
          maxLength={600}
          placeholder="Jak námět zapracujete, nebo proč jej potřebujete upravit?"
        />
      </label>
      <label>
        Navržená alternativa
        <input
          name="alternative"
          required={isDeclined}
          maxLength={200}
          placeholder="Při nezařazení námětu je alternativa povinná."
        />
      </label>
      <Button type="submit">Uložit odpověď</Button>
    </form>
  );
}
export function IdeasView({
  data,
  role,
  onAdd,
  updateData,
}: {
  data: AppData;
  role: Role;
  onAdd: (text: string) => void;
  updateData: UpdateData;
}) {
  const ideas =
    role === "staff"
      ? data.ideas
      : data.ideas.filter((idea) => idea.role === role);
  return (
    <div className="secondary-grid">
      <section className="panel">
        <h2>
          <Lightbulb size={21} />{" "}
          {role === "staff" ? "Náměty od rodičů a žáků" : "Moje náměty"}
        </h2>
        <p className="muted">
          O zařazení rozhoduje vedoucí jídelny. Odpověď najdete přímo u námětu.
        </p>
        {ideas.length === 0 && (
          <div className="empty-state">
            <Lightbulb size={36} />
            <h3>Zatím žádné náměty</h3>
            <p>
              {role === "staff"
                ? "Tady se objeví nápady odeslané rodičem nebo žákem."
                : "Pošlete první nápad na jídlo."}
            </p>
          </div>
        )}
        {ideas.map((idea) => (
          <article key={idea.id} className="idea-item">
            <span className={`status-badge ${idea.status}`}>
              <Clock3 size={12} />
              {idea.status === "pending"
                ? "Čeká na posouzení"
                : idea.status === "accepted"
                  ? "Přijato k plánování"
                  : "Navržena alternativa"}
            </span>
            <h3>{idea.text}</h3>
            <p className="small muted">{USERS[idea.role].name}</p>
            {idea.response && (
              <div className="response">
                <strong>Odpověď jídelny</strong>
                <p>{idea.response}</p>
              </div>
            )}
            {role === "staff" && idea.status === "pending" && (
              <IdeaReview
                onSave={(status, response) =>
                  updateData((current) => ({
                    ...current,
                    ideas: current.ideas.map((item) =>
                      item.id === idea.id
                        ? { ...item, status, response }
                        : item,
                    ),
                  }))
                }
              />
            )}
          </article>
        ))}
      </section>
      {role !== "staff" && (
        <section className="panel">
          <h2>Nový námět</h2>
          <IdeaForm onSubmit={onAdd} />
        </section>
      )}
      {role === "staff" && (
        <section className="panel">
          <h2>Jak s námětem pracovat</h2>
          <p>
            Přijatý námět můžete zařadit úpravou konkrétního jídla v jídelníčku.
          </p>
          <p className="muted">
            Do odpovědi napište den, podobu jídla a důvod případné změny.
            Přijetí samo o sobě jídelníček nemění.
          </p>
        </section>
      )}
    </div>
  );
}
export function FeedbackView({ data, role }: { data: AppData; role: Role }) {
  const entries =
    role === "staff"
      ? data.feedback
      : data.feedback.filter((entry) => entry.role === role);
  const average = entries.length
    ? (
        entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length
      ).toFixed(1)
    : "—";
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>
          <MessageSquare size={21} />{" "}
          {role === "staff" ? "Hodnocení od strávníků" : "Moje hodnocení"}
        </h2>
        <span className="average">
          <Star size={17} /> {average}{" "}
          <span className="muted">/ 5 · {entries.length} hodnocení</span>
        </span>
      </div>
      {entries.length === 0 && (
        <div className="empty-state">
          <Star size={38} />
          <h3>Zatím žádné hodnocení</h3>
          <p>Hodnocení jídla přidáte hvězdičkou v jídelníčku.</p>
        </div>
      )}
      {entries.map((entry) => (
        <article className="feedback-item" key={entry.id}>
          <div className="section-heading">
            <h3>{entry.mealName}</h3>
            <span className="review-stars">
              {"★".repeat(entry.rating)}
              {"☆".repeat(5 - entry.rating)}
            </span>
          </div>
          <p>{entry.comment || "Bez slovního komentáře."}</p>
          <span className="small muted">
            {USERS[entry.role].name} · {USERS[entry.role].label}
          </span>
        </article>
      ))}
    </section>
  );
}
export function PreferencesView({
  data,
  updateData,
}: {
  data: AppData;
  updateData: UpdateData;
}) {
  const OPTIONS = [
    "Častěji bezmasá jídla",
    "Méně sladkých jídel",
    "Více zeleniny",
    "Menší porce",
  ];
  return (
    <section className="panel preferences-panel">
      <h2>Preference Matěje Nováka</h2>
      <p className="muted">
        Preference jsou společné pro dítě a rodiče. Výběr konkrétních obědů
        zůstává na vás.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          updateData((current) => ({
            ...current,
            preferences: fields.getAll("preferences").map(String),
            preferenceNote: String(fields.get("note")).trim(),
          }));
        }}
      >
        <div className="preference-options">
          {OPTIONS.map((option) => (
            <label key={option} className="checkbox-label">
              <input
                type="checkbox"
                name="preferences"
                value={option}
                defaultChecked={data.preferences.includes(option)}
              />
              {option}
            </label>
          ))}
        </div>
        <label>
          Další přání
          <textarea
            name="note"
            defaultValue={data.preferenceNote}
            maxLength={600}
            placeholder="Co by měla jídelna vědět?"
          />
        </label>
        <div className="notice">
          Preference nenahrazují domluvu dietního stravování. Alergie a
          zdravotní omezení řešte přímo s jídelnou.
        </div>
        <Button type="submit">
          <Check size={16} /> Uložit preference
        </Button>
      </form>
    </section>
  );
}
