"use client";
import { useState } from "react";
import { Check, Pencil, Sparkles } from "lucide-react";
import { useMinute } from "./minute-provider";
import { Button } from "./ui/button";
import { EmptyState, SectionHeading } from "./shared";
import { mutate } from "@/lib/store";
import type { Meeting } from "@/lib/types";
import type { useMeetingProcessing } from "@/lib/use-meeting-processing";

export function TranscriptPanel({ meeting, processing }: { meeting: Meeting; processing: ReturnType<typeof useMeetingProcessing> }) {
  const { t, notify } = useMinute();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(meeting.transcript?.text ?? "");
  return (
    <section className="detail-card">
      <SectionHeading title={t("The conversation, word for word", "Rozhovor slovo od slova")}>
        <button
          className="text-link"
          disabled={processing.busy}
          onClick={() => {
            setDraft(meeting.transcript?.text ?? "");
            setEditing(!editing);
          }}
        >
          <Pencil size={14} />
          {editing ? t("Cancel", "Zrušit") : t("Edit", "Upravit")}
        </button>
      </SectionHeading>
      {editing ? (
        <div className="transcript-editor">
          <textarea
            aria-label={t("Edit transcript", "Upravit přepis")}
            rows={18}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            onClick={() => {
              mutate((current) => ({
                ...current,
                meetings: current.meetings.map((item) =>
                  item.id === meeting.id
                    ? {
                        ...item,
                        transcript: {
                          text: draft.trim(),
                          summary: item.transcript?.summary ?? "",
                          updatedAt: new Date().toISOString(),
                        },
                      }
                    : item,
                ),
              }));
              setEditing(false);
              notify(t("Transcript saved", "Přepis uložen"));
            }}
          >
            <Check size={16} />
            {t("Save transcript", "Uložit přepis")}
          </Button>
        </div>
      ) : meeting.transcript?.text ? (
        <div className="transcript-text">
          {meeting.transcript.text.split(/\n\n+/).map((paragraph, i) => (
            <div className="transcript-paragraph" key={i}>
              <span className="paragraph-number">{String(i + 1).padStart(2, "0")}</span>
              <p>{paragraph}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("The words will live here", "Slova budou žít tady")}
          description={t(
            "Record a meeting, upload audio, or add a transcript with Edit.",
            "Nahrajte schůzku, přidejte zvukový soubor nebo vložte přepis tlačítkem Upravit.",
          )}
        />
      )}
      {!editing && (meeting.transcript?.text || !!meeting.recordings.length) && (
        <div className="transcript-footer">
          <Button variant="secondary" disabled={processing.busy} onClick={processing.process}>
            <Sparkles size={16} />
            {t("Generate summary & todos", "Vytvořit shrnutí a úkoly")}
          </Button>
          <span>{t("Review suggestions before acting on them.", "Než začnete, zkontrolujte navržené úkoly.")}</span>
        </div>
      )}
    </section>
  );
}
