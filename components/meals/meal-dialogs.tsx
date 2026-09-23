"use client";
import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./modal";
import {
  ALLERGENS,
  USERS,
  type Feedback,
  type Meal,
  type Role,
} from "@/lib/meal-model";

export function MealDetail({
  meal,
  onClose,
}: {
  meal: Meal;
  onClose: () => void;
}) {
  return (
    <Modal title="Detail jídla" onClose={onClose}>
      <div className="detail-icon">{meal.icon}</div>
      <h3>{meal.name}</h3>
      <p>{meal.side}</p>
      <h4>Alergeny hlavního chodu</h4>
      <p>{meal.allergens}</p>
      <p className="muted small">{ALLERGENS}</p>
      <div className="notice">
        Údaje pocházejí z původního jídelníčku. Nejde o potvrzení vhodnosti pro
        dietu; alergeny polévky a doplňků ověřte u jídelny.
      </div>
      <h4>Původní záznam</h4>
      <p className="small">{meal.source}</p>
    </Modal>
  );
}
export function FeedbackDialog({
  meal,
  previous,
  onSave,
  onClose,
}: {
  meal: Meal;
  previous?: Feedback;
  onSave: (rating: number, comment: string) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(previous?.rating ?? 0);
  return (
    <Modal title="Jak ti chutnalo?" onClose={onClose}>
      <p>
        {meal.icon} {meal.name}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          onSave(rating, String(fields.get("comment")).trim());
        }}
      >
        <div className="stars" role="group" aria-label="Hodnocení od 1 do 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              className={value <= rating ? "active" : ""}
              onClick={() => setRating(value)}
              aria-pressed={value === rating}
              aria-label={`${value} z 5 hvězd`}
            >
              <Star
                size={34}
                fill={value <= rating ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>
        <label>
          Co se povedlo nebo co by mohlo být lepší?
          <textarea
            name="comment"
            maxLength={600}
            defaultValue={previous?.comment}
            placeholder="Například: Omáčka byla dobrá, rýže trochu tvrdá."
          />
        </label>
        <Button type="submit" disabled={rating === 0}>
          Uložit hodnocení
        </Button>
      </form>
    </Modal>
  );
}
export function EditMealDialog({
  meal,
  soup,
  onSave,
  onClose,
}: {
  meal: Meal;
  soup: string;
  onSave: (meal: Meal, soup: string) => void;
  onClose: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name")).trim();
    const nextSoup = String(fields.get("soup")).trim();
    if (!name || !nextSoup) return;
    onSave(
      {
        ...meal,
        name,
        side: String(fields.get("side")).trim(),
        allergens: String(fields.get("allergens")).trim() || "Neuvedeno",
        icon: String(fields.get("icon")),
        source: `Upraveno vedoucí jídelny: ${name}. Alergeny: ${fields.get("allergens")}.`,
      },
      nextSoup,
    );
  }
  return (
    <Modal title="Upravit nabídku" onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          Název jídla
          <input
            name="name"
            required
            maxLength={140}
            defaultValue={meal.name}
          />
        </label>
        <label>
          Příloha / popis
          <input name="side" maxLength={200} defaultValue={meal.side} />
        </label>
        <div className="form-columns">
          <label>
            Ikona
            <select name="icon" defaultValue={meal.icon}>
              {["🍲", "🍗", "🍝", "🥦", "🐟", "🫘", "🍖", "🥣", "🥗", "🥔"].map(
                (icon) => (
                  <option key={icon}>{icon}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Alergeny
            <input
              name="allergens"
              maxLength={80}
              defaultValue={meal.allergens}
            />
          </label>
        </div>
        <label>
          Společná polévka
          <input name="soup" required maxLength={140} defaultValue={soup} />
        </label>
        <p className="small muted">
          Změna se projeví v jídelníčku žáka i rodiče v tomto prohlížeči.
        </p>
        <Button type="submit">Uložit změny</Button>
      </form>
    </Modal>
  );
}
export function LoginDialog({
  onLogin,
  onClose,
}: {
  onLogin: (role: Role) => void;
  onClose: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role>("pupil");
  const [error, setError] = useState("");
  return (
    <Modal title="Přepnout uživatele" onClose={onClose}>
      <p className="muted">
        Vyzkoušejte jednotlivé role pomocí ukázkových účtů.
      </p>
      <div className="role-options">
        {(Object.keys(USERS) as Role[]).map((role) => (
          <button
            key={role}
            className={selectedRole === role ? "active" : ""}
            onClick={() => {
              setSelectedRole(role);
              setError("");
            }}
          >
            {USERS[role].label}
          </button>
        ))}
      </div>
      <div className="demo-credentials">
        <strong>Ukázkový účet · {USERS[selectedRole].name}</strong>
        <span>
          Jméno: <code>{USERS[selectedRole].username}</code> · Heslo:{" "}
          <code>{USERS[selectedRole].password}</code>
        </span>
      </div>
      <form
        key={selectedRole}
        onSubmit={(event) => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          if (
            fields.get("username") === USERS[selectedRole].username &&
            fields.get("password") === USERS[selectedRole].password
          )
            onLogin(selectedRole);
          else
            setError("Jméno nebo heslo neodpovídá vybranému ukázkovému účtu.");
        }}
      >
        <label>
          Uživatelské jméno
          <input
            name="username"
            autoComplete="username"
            defaultValue={USERS[selectedRole].username}
            required
          />
        </label>
        <label>
          Heslo
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue={USERS[selectedRole].password}
            required
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button type="submit">
          Pokračovat jako {USERS[selectedRole].label.toLocaleLowerCase("cs")}
        </Button>
      </form>
    </Modal>
  );
}
