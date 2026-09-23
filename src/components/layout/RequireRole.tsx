"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ROLE_DEFINITIONS } from "@/auth/roles";
import { useSession } from "@/auth/SessionProvider";
import type { UserRole } from "@/model/types";
import { LoadingScreen } from "./LoadingScreen";

interface RequireRoleProps {
  readonly role: UserRole;
  readonly children: ReactNode;
}

/**
 * Renders the children only for a signed-in user with the given role,
 * everyone else is redirected to their own home page or to the login.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const router = useRouter();
  const { currentUser, isHydrated } = useSession();
  const isAllowed = currentUser?.role === role;

  useEffect(() => {
    if (!isHydrated || isAllowed) {
      return;
    }

    router.replace(currentUser ? ROLE_DEFINITIONS[currentUser.role].homePath : "/");
  }, [isHydrated, isAllowed, currentUser, router]);

  if (!isHydrated || !isAllowed) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
