import type { ReactNode } from "react";
import { RoleShell } from "@/components/layout/RoleShell";

const NAVIGATION = [
  { href: "/rodic", label: "Jídelníček" },
  { href: "/rodic/preference", label: "Preference" },
  { href: "/rodic/namety", label: "Náměty" },
];

export default function ParentLayout({ children }: { readonly children: ReactNode }) {
  return (
    <RoleShell role="parent" navigation={NAVIGATION}>
      {children}
    </RoleShell>
  );
}
