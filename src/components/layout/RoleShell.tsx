"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ROLE_DEFINITIONS } from "@/auth/roles";
import { useSession } from "@/auth/SessionProvider";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import type { UserRole } from "@/model/types";
import { LoadingScreen } from "./LoadingScreen";
import { RequireRole } from "./RequireRole";
import { RoleNavigation, type NavigationItem } from "./RoleNavigation";

interface RoleShellProps {
  readonly role: UserRole;
  readonly navigation: readonly NavigationItem[];
  readonly children: ReactNode;
}

/**
 * Page frame shared by every signed-in role: header with the brand and the
 * user, navigation of the role and the tinted content area.
 */
export function RoleShell({ role, navigation, children }: RoleShellProps) {
  return (
    <RequireRole role={role}>
      <div className="role-shell" data-role={role}>
        <RoleHeader role={role} />
        <RoleNavigation items={navigation} />
        <main className="container page-content">
          <HydratedContent>{children}</HydratedContent>
        </main>
      </div>
    </RequireRole>
  );
}

function RoleHeader({ role }: { readonly role: UserRole }) {
  const router = useRouter();
  const { currentUser, logout } = useSession();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <header className="role-header">
      <div className="container role-header-inner">
        <Link href={ROLE_DEFINITIONS[role].homePath} className="role-header-brand">
          <BrandLockup />
        </Link>
        <div className="role-header-user">
          <span className="role-chip">{ROLE_DEFINITIONS[role].label}</span>
          <span className="role-header-name">{currentUser?.displayName}</span>
          <Button variant="ghost" size="small" onClick={handleLogout} aria-label="Odhlásit">
            <LogOut size={16} aria-hidden="true" />
            <span>Odhlásit</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HydratedContent({ children }: { readonly children: ReactNode }) {
  const { isHydrated } = useAppData();
  return isHydrated ? <>{children}</> : <LoadingScreen />;
}
