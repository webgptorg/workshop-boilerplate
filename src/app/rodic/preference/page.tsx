"use client";

import { PageHeading } from "@/components/layout/PageHeading";
import { PreferencesForm } from "@/components/parent/PreferencesForm";
import { useAppData } from "@/hooks/AppDataProvider";
import { useParentChild } from "@/hooks/useParentChild";

export default function ParentPreferencesPage() {
  const { child } = useParentChild();
  const { preferences } = useAppData();

  return (
    <>
      <PageHeading title="Preference">
        <p>Jídla, která {child.displayName} nemůže nebo nechce, se v jídelníčku označí jako nevhodná.</p>
      </PageHeading>
      <PreferencesForm
        key={child.id}
        preferences={preferences.getPreferences(child.id)}
        onSave={(savedPreferences) => preferences.savePreferences(child.id, savedPreferences)}
      />
    </>
  );
}
