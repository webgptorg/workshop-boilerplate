"use client";

import { useCurrentPupil } from "@/components/auth/current-user-context";
import { DinerWeekView } from "@/components/diner/diner-week-view";

export function PupilDashboard() {
  const pupil = useCurrentPupil();

  return (
    <>
      <div className="page-intro">
        <h1>Týdenní jídelníček</h1>
        <p>
          {pupil.displayName}, {pupil.className}. Bez výběru dostaneš Oběd 1. Hodnotit můžeš jídla, která už byla.
        </p>
      </div>

      <DinerWeekView pupilUserId={pupil.id} authorUserId={pupil.id} />
    </>
  );
}
