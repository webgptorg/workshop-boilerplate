"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { MealIcon } from "./meal-icon";
import type { Meal, Role } from "@/lib/types";
export type SaveAction = (body: Record<string, unknown>) => Promise<boolean>;
export function LoginForm({
  onSave,
  isPending,
  isDemoMode,
}: {
  onSave: SaveAction;
  isPending: boolean;
  isDemoMode: boolean;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistration, setIsRegistration] = useState(false);
  const [isResetRequest, setIsResetRequest] = useState(false);
  const DEMO_ACCOUNTS = [
    { name: "Vedoucí · admin", username: "admin", password: "admin" },
    { name: "Adam · žák", username: "adam", password: "adam123" },
    { name: "Jana · jídelna", username: "jidelna", password: "jidelna123" },
    { name: "Petra · rodič", username: "petra", password: "petra123" },
  ];
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const FIELDS = Object.fromEntries(new FormData(event.currentTarget));
        void onSave({ action: isResetRequest ? "requestReset" : isRegistration ? "register" : "login", ...FIELDS, username, password });
      }}
    >
      {isDemoMode && !isRegistration && !isResetRequest && <div className="account-options">{DEMO_ACCOUNTS.map((account)=><button type="button" key={account.username} onClick={()=>{setUsername(account.username);setPassword(account.password);}}>{account.name}</button>)}</div>}
      {isRegistration && <label>Jméno<input name="name" autoComplete="name" required /></label>}
      {isRegistration && <label>Párovací kód dítěte<input name="code" autoComplete="off" required /></label>}
      <label>
        {isRegistration || isResetRequest ? "E-mail" : "E-mail nebo uživatelské jméno"}
        <input
          name={isRegistration || isResetRequest ? "email" : "username"}
          type={isRegistration || isResetRequest ? "email" : "text"}
          autoComplete={isRegistration ? "email" : "username"}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </label>
      {!isResetRequest && <label>
        Heslo
        <input
          autoComplete="current-password"
          type="password"
          minLength={isRegistration ? 12 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>}
      {isRegistration && <p className="form-note">Pro registraci potřebujete párovací kód od jídelny.</p>}
      {isResetRequest && <p className="form-note">Pokud je účet spojený s e-mailem, pošleme odkaz k obnově.</p>}
      <Button type="submit" disabled={isPending}>
        {isResetRequest ? "Poslat odkaz" : isRegistration ? "Vytvořit účet" : "Přihlásit se"}
      </Button>
      {!isResetRequest && <button type="button" className="text-button" onClick={() => setIsRegistration(!isRegistration)}>{isRegistration ? "Už mám účet" : "Registrovat rodiče s kódem"}</button>}
      {!isRegistration && <button type="button" className="text-button" onClick={() => setIsResetRequest(!isResetRequest)}>{isResetRequest?"Zpět na přihlášení":"Zapomenuté heslo"}</button>}
    </form>
  );
}
export function MealForm({
  meal,
  role,
  onSave,
  isPending,
}: {
  meal: Meal;
  role: Role;
  onSave: SaveAction;
  isPending: boolean;
}) {
  const [rating, setRating] = useState(4);
  const IS_STAFF = role === "staff" || role === "manager";
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const FIELDS = Object.fromEntries(new FormData(event.currentTarget));
        void onSave({
          ...FIELDS,
          action: IS_STAFF ? "edit" : "feedback",
          mealId: meal.id,
          rating,
        });
      }}
    >
      <div className="meal-preview">
        <MealIcon kind={meal.icon} isLarge />
        <div>
          <strong>{meal.name}</strong>
          <p>{meal.side}</p>
        </div>
      </div>
      {IS_STAFF ? (
        <>
          <label>
            Název
            <input
              name="name"
              defaultValue={meal.name}
              maxLength={120}
              required
            />
          </label>
          <label>
            Příloha
            <input
              name="side"
              defaultValue={meal.side}
              maxLength={120}
              required
            />
          </label>
          <label>
            Suroviny
            <textarea
              name="ingredients"
              defaultValue={meal.ingredients}
              maxLength={1000}
              required
            />
          </label>
          <label>
            Alergeny hlavního jídla
            <input
              name="allergens"
              defaultValue={meal.allergens}
              maxLength={100}
              required
            />
          </label>
          <label>
            Kategorie
            <select name="category" defaultValue={meal.category}>
              {["Ryba", "Drůbež", "Maso", "Bez masa", "Sladké"].map(
                (category) => (
                  <option key={category}>{category}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Ikona jídla
            <select name="icon" defaultValue={meal.icon}>
              {Object.entries({
                fish: "Ryba",
                pasta: "Těstoviny",
                chicken: "Kuře",
                greens: "Placičky",
                meatballs: "Masové kuličky",
                rice: "Rizoto",
                mushroom: "Žampiony",
                lentils: "Čočka",
                salad: "Kuskus",
                sweet: "Sladké dukátky",
              }).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Společná polévka
            <input
              name="soup"
              defaultValue={meal.soup}
              required
              maxLength={120}
            />
          </label>
          <p className="form-note">
            Změna se ihned zobrazí žákům i rodičům. Polévka se aktualizuje pro
            oba obědy dne.
          </p>
        </>
      ) : (
        <>
          <dl>
            <dt>Suroviny</dt>
            <dd>{meal.ingredients}</dd>
            <dt>Alergeny hlavního jídla</dt>
            <dd>{meal.allergens}</dd>
          </dl>
          <p className="form-note">
            Ukázková receptura. Alergeny polévky a doplňků nejsou ověřeny;
            dietní stravování řešte s jídelnou.
          </p>
          <label>Hodnocení</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                aria-label={`${value} z 5 hvězdiček`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
              >
                <Star
                  fill={value <= rating ? "#c59a4d" : "none"}
                  color="#c59a4d"
                />
              </button>
            ))}
          </div>
          <label>
            Komentář
            <textarea
              name="comment"
              maxLength={1000}
              placeholder="Co vám chutnalo, co můžeme změnit?"
            />
          </label>
        </>
      )}
      <Button disabled={isPending} type="submit">
        {IS_STAFF ? "Uložit změny" : "Uložit hodnocení"}
      </Button>
    </form>
  );
}
