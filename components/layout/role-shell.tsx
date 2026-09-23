"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/components/auth/current-user-context";
import { Button } from "@/components/ui";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "./app-shell";
import { RoleBadge } from "./role-badge";

/**
 * `AppShell` for a logged-in user: shows who is logged in and lets them log out.
 */
export function RoleShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();
  const { logout } = useSession();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <AppShell
      role={user.role}
      headerContent={
        <div className="app-header-user">
          <RoleBadge role={user.role} />
          <span className="app-header-user-name">{user.displayName}</span>
          <Button variant="ghost" size="small" onClick={handleLogout} aria-label="Odhlásit se">
            <LogOut size={16} />
            <span className="app-header-logout-label">Odhlásit</span>
          </Button>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
