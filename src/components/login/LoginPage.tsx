"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLE_DEFINITIONS } from "@/auth/roles";
import { useSession } from "@/auth/SessionProvider";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  const router = useRouter();
  const { currentUser, isHydrated } = useSession();

  useEffect(() => {
    if (currentUser) {
      router.replace(ROLE_DEFINITIONS[currentUser.role].homePath);
    }
  }, [currentUser, router]);

  if (!isHydrated || currentUser) {
    return <LoadingScreen />;
  }

  return (
    <main className="login-page">
      <div className="login-panel">
        <BrandLockup isTaglineShown size="large" />
        <LoginForm />
      </div>
    </main>
  );
}
