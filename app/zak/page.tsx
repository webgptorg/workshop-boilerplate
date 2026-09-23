import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { RoleShell } from "@/components/layout/role-shell";
import { PupilDashboard } from "@/components/pupil/pupil-dashboard";

export const metadata: Metadata = {
  title: "Žák",
};

export default function PupilPage() {
  return (
    <RoleGuard role="PUPIL">
      <RoleShell>
        <PupilDashboard />
      </RoleShell>
    </RoleGuard>
  );
}
