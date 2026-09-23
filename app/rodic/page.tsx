import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { RoleShell } from "@/components/layout/role-shell";
import { ParentDashboard } from "@/components/parent/parent-dashboard";

export const metadata: Metadata = {
  title: "Rodič",
};

export default function ParentPage() {
  return (
    <RoleGuard role="PARENT">
      <RoleShell>
        <ParentDashboard />
      </RoleShell>
    </RoleGuard>
  );
}
