"use client";

import { flushStore, useSaveStatus } from "@/lib/store";
import { Button } from "./ui/button";

export function SaveStatus() {
  const status = useSaveStatus();
  return (
    <div className={`save-status${status.error ? " save-status-error" : ""}`} role="status" aria-live="polite">
      {status.error || (status.isSaving ? "Saving changes..." : status.isDirty ? "Changes waiting to save..." : "All changes saved")}
      {status.error && !status.isConflict && <Button variant="secondary" onClick={() => void flushStore()}>Retry save</Button>}
      {status.isConflict && <Button variant="secondary" onClick={() => window.location.reload()}>Reload latest data</Button>}
    </div>
  );
}
