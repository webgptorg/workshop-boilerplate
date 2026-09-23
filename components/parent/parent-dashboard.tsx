"use client";

import { useCurrentParent } from "@/components/auth/current-user-context";
import { DinerWeekView } from "@/components/diner/diner-week-view";
import { PreferencesForm } from "@/components/preferences/preferences-form";
import { getPupilUserById } from "@/lib/users";

export function ParentDashboard() {
  const parent = useCurrentParent();
  const child = getPupilUserById(parent.childUserId);

  return (
    <>
      <div className="page-intro">
        <h1>Jídelníček pro {child.displayName}</h1>
        <p>
          Třída {child.className}. Výběr obědu můžete změnit vy i {child.displayName}; bez výběru dostane Oběd 1.
        </p>
      </div>

      <DinerWeekView pupilUserId={child.id} authorUserId={parent.id} />

      <section className="page-section" aria-labelledby="preferences-heading">
        <h2 id="preferences-heading" className="section-heading">
          Preference dítěte
        </h2>
        <p className="section-description">
          Podle preferencí aplikace u každého dne doporučí vhodnější variantu. Jídelna preference nevidí.
        </p>
        <PreferencesForm pupilUserId={child.id} pupilDisplayName={child.displayName} />
      </section>
    </>
  );
}
