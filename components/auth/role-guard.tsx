"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { ROLE_DEFINITIONS, type UserRole } from "@/lib/users";
import { CurrentUserProvider } from "./current-user-context";

export type RoleGuardProps = {
  role: UserRole;
  children: ReactNode;
};

/**
 * Renders the children only for a logged-in user with the given role.
 *
 * Anonymous visitors go to the login screen; users with another role go to their own home.
 */
export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();
  const { isHydrated, currentUser } = useSession();
  const isAllowed = currentUser !== null && currentUser.role === role;

  useEffect(() => {
    if (!isHydrated || isAllowed) {
      return;
    }

    router.replace(currentUser === null ? "/" : ROLE_DEFINITIONS[currentUser.role].homePath);
  }, [isHydrated, isAllowed, currentUser, router]);

  if (!isHydrated || currentUser === null || !isAllowed) {
    return (
      <p className="screen-status" role="status">
        Načítám…
      </p>
    );
  }

  return <CurrentUserProvider user={currentUser}>{children}</CurrentUserProvider>;
}
