"use client";

import { hasUnsavedChanges, saveChanges, useAppState, usePersistence } from "@/lib/store";
import { downloadText } from "@/lib/utils";
import { Button } from "./ui/button";

export function SaveStatus() {
  const persistence = usePersistence();
  const state = useAppState();
  if (!state) return null;
  return <div className={`save-status${persistence.error ? " save-error" : ""}`} role="status">
    <span>{persistence.error || (persistence.isSaving ? "Saving…" : hasUnsavedChanges() ? "Unsaved changes" : "Saved to your account")}</span>
    {persistence.error && <>
      <Button variant="secondary" onClick={() => downloadText("minute-unsaved-backup.json", JSON.stringify(state, null, 2), "application/json")}>Export unsaved work</Button>
      {!persistence.isConflict && <Button variant="secondary" onClick={() => void saveChanges()}>Retry save</Button>}
      <Button variant="secondary" onClick={() => {
        if (window.confirm("Reload and discard unsaved changes? Export a backup first if you need them.")) window.location.reload();
      }}>Reload saved data</Button>
    </>}
  </div>;
}
