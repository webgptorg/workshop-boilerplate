import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import type { UserRole } from "@/lib/users";

export type AppShellProps = {
  role: UserRole;
  /**
   * Right side of the header, typically the current user and the logout button.
   */
  headerContent?: ReactNode;
  children: ReactNode;
};

/**
 * Page frame with header, content and footer. The `data-role` attribute switches the color tint.
 */
export function AppShell({ role, headerContent, children }: AppShellProps) {
  return (
    <div className="app-shell" data-role={role}>
      <header className="app-header">
        <div className="container app-header-inner">
          <Logo />
          {headerContent}
        </div>
      </header>

      <main className="container app-main">{children}</main>

      <footer className="app-footer">
        <div className="container">Společný stůl · ukázková verze bez databáze, data zůstávají v tomto prohlížeči</div>
      </footer>
    </div>
  );
}
