import type { ReactNode } from "react";
import { RoleShell } from "@/components/layout/RoleShell";

const NAVIGATION = [{ href: "/zak", label: "Jídelníček" }];

export default function PupilLayout({ children }: { readonly children: ReactNode }) {
  return (
    <RoleShell role="pupil" navigation={NAVIGATION}>
      {children}
    </RoleShell>
  );
}
