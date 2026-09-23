import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { RoleShell } from "@/components/layout/role-shell";
import { StaffDashboard } from "@/components/staff/staff-dashboard";

export const metadata: Metadata = {
  title: "Jídelna",
};

export default function StaffPage() {
  return (
    <RoleGuard role="STAFF">
      <RoleShell>
        <StaffDashboard />
      </RoleShell>
    </RoleGuard>
  );
}
