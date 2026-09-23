"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { useSession } from "@/hooks/use-session";
import { ROLE_DEFINITIONS, type User } from "@/lib/users";
import { DemoAccounts } from "./demo-accounts";
import { LoginForm } from "./login-form";

function goToRoleHome(router: ReturnType<typeof useRouter>, user: User): void {
  router.replace(ROLE_DEFINITIONS[user.role].homePath);
}

export function LoginScreen() {
  const router = useRouter();
  const { isHydrated, currentUser, login } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // A returning visitor with a session skips the login screen.
  useEffect(() => {
    if (isHydrated && currentUser !== null) {
      goToRoleHome(router, currentUser);
    }
  }, [isHydrated, currentUser, router]);

  function handlePickDemoAccount(user: User) {
    setUsername(user.username);
    setPassword(user.password);
  }

  return (
    <main className="login-screen">
      <div className="login-panel">
        <Logo size="large" />
        <p className="login-description">Týdenní jídelníček školní jídelny pro žáky, rodiče a jídelnu.</p>

        <LoginForm
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onLogin={login}
          onLoggedIn={(user) => goToRoleHome(router, user)}
        />

        <DemoAccounts onPick={handlePickDemoAccount} />
      </div>
    </main>
  );
}
