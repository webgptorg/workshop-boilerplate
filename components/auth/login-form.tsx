"use client";

import { LogIn } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button, Field, Input } from "@/components/ui";
import { AuthenticationError } from "@/lib/errors";
import type { User } from "@/lib/users";

export type LoginFormProps = {
  username: string;
  password: string;
  onUsernameChange: (username: string) => void;
  onPasswordChange: (password: string) => void;
  /**
   * @throws {AuthenticationError} when the credentials are wrong
   */
  onLogin: (username: string, password: string) => User;
  onLoggedIn: (user: User) => void;
};

export function LoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  onLoggedIn,
}: LoginFormProps) {
  const usernameId = useId();
  const passwordId = useId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      onLoggedIn(onLogin(username, password));
    } catch (error) {
      if (!(error instanceof AuthenticationError)) {
        throw error;
      }

      setErrorMessage("Nesprávné jméno nebo heslo.");
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <Field label="Uživatelské jméno" htmlFor={usernameId}>
        <Input
          id={usernameId}
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          required
        />
      </Field>
      <Field label="Heslo" htmlFor={passwordId}>
        <Input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
        />
      </Field>

      {errorMessage ? (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" className="login-submit">
        <LogIn size={18} />
        Přihlásit se
      </Button>
    </form>
  );
}
