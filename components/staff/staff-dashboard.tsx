"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useCurrentStaff } from "@/components/auth/current-user-context";
import { Button } from "@/components/ui";
import { resetAllStores } from "@/lib/storage";
import { startSession } from "@/lib/users";
import { FeedbackOverview } from "./feedback-overview";
import { MealCatalogManager } from "./meal-catalog-manager";
import { WeekPlanEditor } from "./week-plan-editor";

type StaffTab = "PLAN" | "MEALS" | "FEEDBACK";

const STAFF_TABS: readonly { readonly id: StaffTab; readonly label: string }[] = [
  { id: "PLAN", label: "Jídelníček" },
  { id: "MEALS", label: "Jídla" },
  { id: "FEEDBACK", label: "Zpětná vazba" },
];

export function StaffDashboard() {
  const staff = useCurrentStaff();
  const [activeTab, setActiveTab] = useState<StaffTab>("PLAN");

  function handleResetDemoData() {
    const isConfirmed = window.confirm(
      "Smazat všechny úpravy, výběry a hodnocení v tomto prohlížeči a vrátit ukázková data?",
    );

    if (!isConfirmed) {
      return;
    }

    resetAllStores();
    startSession(staff.id);
  }

  return (
    <>
      <div className="page-intro">
        <h1>Správa jídelníčku</h1>
        <p>
          {staff.displayName}, {staff.position}. Změny se ukládají hned; žáci a rodiče je vidí po obnovení stránky.
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Sekce">
        {STAFF_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className="tab"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === "PLAN" ? <WeekPlanEditor /> : null}
        {activeTab === "MEALS" ? <MealCatalogManager /> : null}
        {activeTab === "FEEDBACK" ? <FeedbackOverview /> : null}
      </div>

      <div className="danger-zone">
        <Button variant="ghost" size="small" onClick={handleResetDemoData}>
          <RotateCcw size={16} />
          Obnovit ukázková data
        </Button>
      </div>
    </>
  );
}
