"use client";
import { Planner } from "./planner";
import { Button } from "./ui/button";
import type { AppData } from "@/lib/types";
import type { SaveAction } from "./forms";
import { AccountPanel } from "./account";
export function Community({
  data,
  view,
  onSave,
  isPending,
}: {
  data: AppData;
  view: string;
  onSave: SaveAction;
  isPending: boolean;
}) {
  const IS_STAFF = (data.user?.role === "staff" || data.user?.role === "manager");
  if (view === "account") return <AccountPanel data={data} onSave={onSave} isPending={isPending} />;
  if (view === "preferences")
    return (
      <section className="content-panel">
        <p className="child-name">{data.diners.find((diner) => diner.id === data.activeDinerId)?.name}{data.diners.find((diner) => diner.id === data.activeDinerId)?.className ? ` · ${data.diners.find((diner) => diner.id === data.activeDinerId)?.className}` : ""}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSave({
              action: "preferences",
              text: new FormData(event.currentTarget).get("text"),
            });
          }}
        >
          <label>
            Oblíbená jídla a potraviny, které dítě nejí
            <textarea
              name="text"
              defaultValue={data.preferences}
              maxLength={1000}
            />
          </label>
          <p className="form-note">
            Preference vidí jídelna. Nenahrazují oficiální postup jídelny pro
            dietní stravování a alergie.
          </p>
          <Button type="submit" disabled={isPending}>
            Uložit preference
          </Button>
        </form>
      </section>
    );
  if (view === "feedback")
    return (
      <section className="content-panel">
        {data.feedback.length === 0 && (
          <p>
            Zatím žádné hodnocení. Jídlo ohodnotíte přes hvězdičku v jídelníčku.
          </p>
        )}
        {data.feedback.map((feedback) => (
          <article className="feedback-row" key={feedback.id}>
            <div>
              <strong>{feedback.meal}</strong>
              <span className="rating-text">
                {"★".repeat(feedback.rating)}
                {"☆".repeat(5 - feedback.rating)}
              </span>
            </div>
            <p>{feedback.comment || "Bez komentáře"}</p>
            <small>{feedback.name}</small>
          </article>
        ))}
      </section>
    );
  return (
    <section className="content-panel">
      {IS_STAFF && (
        <Planner data={data} onSave={onSave} isPending={isPending} />
      )}
      {!IS_STAFF && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const FORM = event.currentTarget;
            if (
              await onSave({
                action: "idea",
                text: new FormData(FORM).get("text"),
              })
            )
              FORM.reset();
          }}
        >
          <label>
            Jaké jídlo byste zařadili?
            <textarea
              name="text"
              required
              maxLength={1000}
              placeholder="Například špagety s rajčatovou omáčkou…"
            />
          </label>
          <Button disabled={isPending} type="submit">
            Poslat námět jídelně
          </Button>
        </form>
      )}
      {data.ideas.length === 0 && (
        <p className="empty-state">Zatím žádné náměty.</p>
      )}
      {data.ideas.map((idea) => (
        <article key={idea.id} className="idea-row">
          <div className="section-heading">
            <strong>{idea.text}</strong>
            <span className="status-pill">{idea.status}</span>
          </div>
          <small>{idea.name}</small>
          {idea.response && <p className="idea-response">{idea.response}</p>}
          {IS_STAFF && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onSave({
                  ...Object.fromEntries(new FormData(event.currentTarget)),
                  action: "resolve",
                  ideaId: idea.id,
                });
              }}
            >
              <label>
                Rozhodnutí
                <select
                  name="status"
                  defaultValue={
                    idea.status === "Čeká na vyřízení"
                      ? "Upraveno"
                      : idea.status
                  }
                >
                  <option>Přijato</option>
                  <option>Upraveno</option>
                  <option>Nezařazeno</option>
                </select>
              </label>
              <label>
                Vysvětlení pro rodiče, při nezařazení také alternativa
                <textarea
                  name="response"
                  required
                  maxLength={1000}
                  defaultValue={idea.response}
                />
              </label>
              <Button type="submit" disabled={isPending}>
                Odeslat odpověď
              </Button>
            </form>
          )}
        </article>
      ))}
    </section>
  );
}
