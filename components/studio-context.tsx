"use client";
import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { useMinute } from "./minute-provider";
import { MeetingPeople } from "./meeting-people";
import { Button } from "./ui/button";
import { mutate } from "@/lib/store";
import type { Meeting } from "@/lib/types";

export function StudioContext({ meeting, liveText, occupied }: { meeting: Meeting; liveText: string; occupied: boolean }) {
  const { t, notify } = useMinute();
  const [manual, setManual] = useState(false);
  const [draft, setDraft] = useState(meeting.transcript?.text ?? "");
  return (
    <aside>
      <section className="detail-card studio-context">
        <h2>{t("In this conversation", "V tomto rozhovoru")}</h2>
        <MeetingPeople meeting={meeting} />
      </section>
      <section className="detail-card live-transcript">
        <h2>
          <FileText size={17} />
          {t("Live transcript", "Živý přepis")}
        </h2>
        {liveText ? (
          <p className="live-text">{liveText}</p>
        ) : (
          <p className="muted">
            {t(
              "Live captions appear here in supported browsers. Your complete transcript is created when you finish.",
              "Živé titulky se zobrazí v podporovaných prohlížečích. Úplný přepis vznikne po dokončení.",
            )}
          </p>
        )}
        <div className="ai-note">
          <Sparkles size={15} />
          {t("A transcript. A summary. Your next steps.", "Přepis. Shrnutí. Vaše další kroky.")}
        </div>
      </section>
      <button className="text-link manual-transcript-toggle" onClick={() => setManual(!manual)}>
        <FileText size={15} />
        {t("Add a transcript manually", "Přidat přepis ručně")}
      </button>
      {manual && (
        <div className="manual-transcript">
          <textarea
            aria-label={t("Meeting transcript", "Přepis schůzky")}
            placeholder={t("Paste the conversation here…", "Vložte sem rozhovor…")}
            rows={8}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            variant="secondary"
            disabled={occupied || !draft.trim()}
            onClick={() => {
              mutate((current) => ({
                ...current,
                meetings: current.meetings.map((item) =>
                  item.id === meeting.id
                    ? {
                        ...item,
                        transcript: { text: draft, summary: item.transcript?.summary ?? "", updatedAt: new Date().toISOString() },
                      }
                    : item,
                ),
              }));
              notify(t("Transcript saved", "Přepis uložen"));
            }}
          >
            {t("Save transcript", "Uložit přepis")}
          </Button>
        </div>
      )}
    </aside>
  );
}
