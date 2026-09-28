"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Mic, Plus } from "lucide-react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { LanguagePicker } from "./language-picker";
import { useMinute } from "../minute-provider";
import { mutate } from "@/lib/store";
import { localDateTime, uid } from "@/lib/utils";
import type { Meeting, Workspace } from "@/lib/types";

export function MeetingDialog({
  workspace,
  onClose,
  meeting,
  scheduled = false,
}: {
  workspace: Workspace;
  onClose: () => void;
  meeting?: Meeting;
  scheduled?: boolean;
}) {
  const { t, notify, state } = useMinute();
  const router = useRouter();
  const [languages, setLanguages] = useState(meeting?.languages ?? workspace.languages);
  const [mode, setMode] = useState(scheduled ? "schedule" : "now");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title")).trim();
    if (!title) return;
    const next: Meeting = {
      id: meeting?.id ?? uid(),
      workspaceId: workspace.id,
      title,
      description: String(form.get("description") ?? "").trim(),
      date: new Date(String(form.get("date"))).toISOString(),
      duration: Number(form.get("duration")) || 30,
      participants: [
        ...new Set(
          String(form.get("participants"))
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean),
        ),
      ],
      languages,
      status: meeting?.status ?? "scheduled",
      color: meeting?.color ?? "cyan",
      recordings: meeting?.recordings ?? [],
      transcript: meeting?.transcript,
      processedText: meeting?.processedText,
      transcriptRecordingIds: meeting?.transcriptRecordingIds,
    };
    mutate((current) => ({
      ...current,
      meetings: meeting ? current.meetings.map((item) => (item.id === meeting.id ? next : item)) : [next, ...current.meetings],
    }));
    notify(meeting ? t("Meeting updated", "Schůzka upravena") : t("Meeting created", "Schůzka vytvořena"));
    onClose();
    if (!meeting) router.push(`/${workspace.id}/meetings/${next.id}${mode === "now" ? "/studio" : ""}`);
  }
  return (
    <Modal
      title={meeting ? t("Edit meeting", "Upravit schůzku") : t("A good conversation starts here.", "Tady začíná dobrý rozhovor.")}
      subtitle={t("Give your meeting a home. Minute takes care of the details.", "Dejte schůzce prostor. Minute se postará o detaily.")}
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={submit}>
        {!meeting && (
          <div className="segmented-control">
            <button type="button" className={mode === "now" ? "active" : ""} onClick={() => setMode("now")}>
              <Mic size={16} />
              {t("Meet now", "Začít hned")}
            </button>
            <button type="button" className={mode === "schedule" ? "active" : ""} onClick={() => setMode("schedule")}>
              <CalendarDays size={16} />
              {t("Schedule for later", "Naplánovat")}
            </button>
          </div>
        )}
        <label className="field-label">
          {t("Meeting title", "Název schůzky")}
          <input
            name="title"
            required
            autoFocus
            maxLength={160}
            defaultValue={meeting?.title}
            placeholder={t("e.g. Weekly team sync", "Např. Týdenní porada")}
          />
        </label>
        <div className="form-grid">
          <label className="field-label">
            {t("Date & time", "Datum a čas")}
            <input type="datetime-local" name="date" required defaultValue={localDateTime(meeting?.date)} />
          </label>
          <label className="field-label">
            {t("Duration", "Délka")}
            <select name="duration" defaultValue={meeting?.duration ?? 30}>
              {[15, 30, 45, 60, 90, 120].map((minutes) => (
                <option value={minutes} key={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field-label">
          {t("Participants", "Účastníci")}
          <input
            name="participants"
            defaultValue={meeting?.participants.join(", ") ?? state.user.name}
            placeholder={t("Names, separated by commas", "Jména oddělená čárkami")}
          />
          <span className="field-hint">{t("Separate names with commas.", "Jména oddělte čárkami.")}</span>
        </label>
        <label className="field-label">
          {t("Description", "Popis")}
          <textarea
            name="description"
            rows={3}
            defaultValue={meeting?.description}
            placeholder={t("What’s on the agenda? Markdown is welcome.", "Co je na programu? Můžete použít Markdown.")}
          />
        </label>
        <div className="field-label">
          {t("Meeting languages", "Jazyky schůzky")}
          <LanguagePicker value={languages} onChange={setLanguages} />
          <span className="field-hint">
            {t(
              "Inherited from your workspace. Change them for this meeting.",
              "Převzato z pracovního prostoru. Pro tuto schůzku je můžete změnit.",
            )}
          </span>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            {t("Cancel", "Zrušit")}
          </Button>
          <Button type="submit">
            {meeting ? <Plus size={17} /> : mode === "now" ? <Mic size={17} /> : <CalendarDays size={17} />}
            {meeting
              ? t("Save changes", "Uložit změny")
              : mode === "now"
                ? t("Open meeting studio", "Otevřít studio")
                : t("Schedule meeting", "Naplánovat schůzku")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
