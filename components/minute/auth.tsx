"use client";
import { useState } from "react";
import { Button } from "@/components/ui";
import { getAccounts, hashPassword } from "@/lib/minute/storage";
import { demoUsers, type Account } from "@/lib/minute/types";
import { uid } from "@/lib/minute/utils";
import { useMinute } from "./provider";
import { Icon, Logo } from "./icon";
export function Auth() {
  const { login, t, notify } = useMinute();
  const [mode, setMode] = useState<"login" | "signup" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const accounts = getAccounts();
      const existing = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase().trim(),
      );
      if (mode === "login") {
        if (
          !existing ||
          !(existing.passwordHash
            ? existing.passwordHash === (await hashPassword(password))
            : password === "minute123")
        )
          throw new Error(
            t(
              "Email or password is incorrect.",
              "E-mail nebo heslo není správné.",
            ),
          );
        login({ id: existing.id, name: existing.name, email: existing.email });
      } else if (mode === "signup") {
        if (existing)
          throw new Error(
            t("This email already has an account.", "Tento e-mail už má účet."),
          );
        const account: Account = {
          id: uid(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: await hashPassword(password),
        };
        localStorage.setItem(
          "minute:accounts",
          JSON.stringify([
            ...accounts.filter((a) => !demoUsers.some((d) => d.id === a.id)),
            account,
          ]),
        );
        login({ id: account.id, name: account.name, email: account.email });
      } else {
        if (!existing)
          throw new Error(
            t(
              "No local account uses this email.",
              "Pro tento e-mail neexistuje místní účet.",
            ),
          );
        if (demoUsers.some((d) => d.id === existing.id)) {
          notify(
            t("The demo password is minute123.", "Demo heslo je minute123."),
          );
        } else {
          const newHash = await hashPassword(password);
          localStorage.setItem(
            "minute:accounts",
            JSON.stringify(
              accounts
                .filter((a) => !demoUsers.some((d) => d.id === a.id))
                .map((a) =>
                  a.id === existing.id ? { ...a, passwordHash: newHash } : a,
                ),
            ),
          );
          notify(
            t(
              "Local password reset. You can now sign in.",
              "Místní heslo bylo změněno.",
            ),
          );
        }
        setMode("login");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-decoration">
        <div className="auth-orbit" />
        <Logo />
        <h1>
          {t(
            "A good conversation.\nA clear next step.",
            "Dobrý rozhovor.\nJasný další krok.",
          )}
        </h1>
        <span className="auth-bottom">MADE FOR THE MOMENTS THAT MATTER</span>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">YOUR SPACE TO THINK</span>
          <h1>
            {mode === "login"
              ? t("Welcome back.", "Vítejte zpět.")
              : mode === "signup"
                ? t("Make yourself at home.", "Vítejte v Minute.")
                : t("A fresh start.", "Nový začátek.")}
          </h1>
          {mode === "signup" && (
            <label className="field">
              {t("Your name", "Vaše jméno")}
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          <label className="field">
            {t("Email", "E-mail")}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            {mode === "recover"
              ? t("New local password", "Nové místní heslo")
              : t("Password", "Heslo")}
            <input
              type="password"
              required
              minLength={mode === "login" ? 1 : 6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {mode === "recover" && (
            <p className="muted small">
              {t(
                "Demo recovery resets this browser’s account only. No email is sent. Use a demo-only password.",
                "Obnova změní pouze účet v tomto prohlížeči. E-mail se neposílá. Použijte pouze demo heslo.",
              )}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy
              ? t("One moment…", "Moment…")
              : mode === "login"
                ? t("Sign in", "Přihlásit se")
                : mode === "signup"
                  ? t("Create local account", "Vytvořit místní účet")
                  : t("Reset local password", "Obnovit místní heslo")}
            <Icon name="arrow" size={17} />
          </Button>
          <div className="auth-links">
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? t("Create an account", "Vytvořit účet")
                : t("Back to sign in", "Zpět na přihlášení")}
            </button>
            {mode === "login" && (
              <button
                type="button"
                className="text-button"
                onClick={() => setMode("recover")}
              >
                {t("Forgot password?", "Zapomenuté heslo?")}
              </button>
            )}
          </div>
          <div className="demo-accounts">
            <span className="eyebrow">
              {t("TAKE A LOOK AROUND", "VYZKOUŠEJTE SI MINUTE")}
            </span>
            {demoUsers.map((user) => (
              <button
                className="demo-account"
                type="button"
                key={user.id}
                onClick={() => login(user)}
              >
                <span className="avatar">{user.name[0]}</span>
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
                <Icon name="arrow" size={18} />
              </button>
            ))}
            <p className="small muted">
              {t(
                "Demo password: minute123 · Data stays in this browser",
                "Demo heslo: minute123 · Data zůstávají v prohlížeči",
              )}
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
