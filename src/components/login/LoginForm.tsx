"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MOCKED_USERS, type MockedUser } from "@/auth/mockedUsers";
import { ROLE_DEFINITIONS } from "@/auth/roles";
import { useSession } from "@/auth/SessionProvider";
import { Button, Field, Notice } from "@/components/ui";
import { SpolecnyStulError } from "@/errors";

export function LoginForm() {
  const router = useRouter();
  const { login } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function signIn(candidateUsername: string, candidatePassword: string) {
    try {
      const user = login(candidateUsername, candidatePassword);
      router.replace(ROLE_DEFINITIONS[user.role].homePath);
    } catch (error) {
      setErrorMessage(error instanceof SpolecnyStulError ? error.message.split("\n")[0] : "Přihlášení se nezdařilo.");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    signIn(username, password);
  }

  return (
    <div className="login-form-area">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Přihlášení</h1>
        <Field label="Uživatelské jméno">
          <input className="input" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
        </Field>
        <Field label="Heslo">
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        {errorMessage && <Notice tone="danger">{errorMessage}</Notice>}
        <Button type="submit">Přihlásit</Button>
      </form>
      <div className="demo-accounts">
        <p className="field-label">Zkušební účty</p>
        <ul className="demo-account-list">
          {MOCKED_USERS.map((user) => (
            <DemoAccount key={user.id} user={user} onPick={() => signIn(user.username, user.password)} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function DemoAccount({ user, onPick }: { readonly user: MockedUser; readonly onPick: () => void }) {
  return (
    <li>
      <button type="button" className="demo-account" data-role={user.role} onClick={onPick}>
        <span className="demo-account-role">{ROLE_DEFINITIONS[user.role].label}</span>
        <span className="demo-account-name">{user.displayName}</span>
        <span className="demo-account-credentials">
          {user.username} / {user.password}
        </span>
      </button>
    </li>
  );
}
