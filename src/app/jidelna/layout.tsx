import type { ReactNode } from "react";
import { RoleShell } from "@/components/layout/RoleShell";

const NAVIGATION = [
  { href: "/jidelna", label: "Plán týdne" },
  { href: "/jidelna/jidla", label: "Jídla" },
  { href: "/jidelna/hodnoceni", label: "Hodnocení" },
  { href: "/jidelna/namety", label: "Náměty" },
];

export default function StaffLayout({ children }: { readonly children: ReactNode }) {
  return (
    <RoleShell role="staff" navigation={NAVIGATION}>
      {children}
    </RoleShell>
  );
}
