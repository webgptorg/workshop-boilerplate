"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import type { Recording } from "@/lib/minute/types";
import { audioKey, getAudio } from "@/lib/minute/storage";
import { draftNotes, durationLabel, shortDate } from "@/lib/minute/utils";
import { useMinute } from "./provider";
import { Avatar, EmptyState, ExportMenu, Notes } from "./shared";
import { Actions } from "./actions";
import { Icon } from "./icon";
function SavedAudio({ recording }: { recording: Recording }) {
  const { user, workspace, t } = useMinute();
  const [url, setUrl] = useState("");
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    if (user && workspace)
      getAudio(audioKey(user.id, workspace.id, recording.id))
        .then((blob) => {
          if (!active) return;
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
          } else setMissing(true);
        })
        .catch(() => {
          if (active) setMissing(true);
        });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user, workspace, recording.id]);
  return (
    <Card className="saved-audio">
      <div>
        <Icon name="headphones" size={20} />
        <strong>{recording.name}</strong>
        <span className="muted small">{durationLabel(recording.duration)}</span>
        {url && (
          <a
            href={url}
            download={recording.name}
            className="icon-button"
            aria-label="Download recording"
          >
            <Icon name="download" size={17} />
          </a>
        )}
      </div>
      {url ? (
        <audio controls src={url} />
      ) : (
        <p className="small muted">
          {missing
            ? t(
                "Audio is unavailable in this browser.",
                "Zvuk není v tomto prohlížeči dostupný.",
              )
            : t("Loading audio…", "Načítání zvuku…")}
        </p>
      )}
    </Card>
  );
}
export function CallDetail({
  id,
  onAction,
}: {
  id: string;
  onAction: (id: string) => void;
}) {
  const { workspace, updateCall, language, t, notify } = useMinute();
  const call = workspace?.calls.find((c) => c.id === id);
  const [tab, setTab] = useState("notes");
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(call?.notes || "");
  const [transcript, setTranscript] = useState(call?.transcript || "");
  const [title, setTitle] = useState(call?.title || "");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "actions")
      queueMicrotask(() => setTab("actions"));
  }, []);
  if (!call || !workspace)
    return (
      <EmptyState
        title={t("This call couldn’t be found.", "Tento hovor nebyl nalezen.")}
      >
        <Link
          className="button button-primary"
          href={`/${workspace?.id || "personal"}/calls`}
        >
          {t("Back to calls", "Zpět na hovory")}
        </Link>
      </EmptyState>
    );
  const actions = workspace.actions.filter((a) => a.callIds.includes(id));
  return (
    <>
      <div className="page-heading detail-heading">
        <div>
          <span
            className={`category-badge category-${call.category.toLowerCase()}`}
          >
            {call.category}
          </span>
          {editing ? (
            <input
              className="edit-title-input"
              aria-label="Call title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            <h1>{call.title}</h1>
          )}
          <div className="detail-meta">
            <span>
              <Icon name="calendar" size={15} />
              {shortDate(call.date, language)}
            </span>
            <span>
              <Icon name="clock" size={15} />
              {durationLabel(call.duration)}
            </span>
            <div className="avatar-stack">
              {call.participants.map((p, i) => (
                <Avatar small name={p} index={i} key={p} />
              ))}
            </div>
            <span>{call.language}</span>
          </div>
        </div>
        <div className="heading-actions">
          <button
            className={`icon-button detail-star ${call.starred ? "starred" : ""}`}
            aria-label="Toggle favorite"
            onClick={() => updateCall(id, { starred: !call.starred })}
          >
            <Icon name="star" />
          </button>
          <ExportMenu call={call} />
        </div>
      </div>
      <div className="call-detail-layout">
        <div className="call-detail-main">
          <div className="detail-tabs call-tabs">
            {[
              ["notes", t("Notes", "Poznámky"), "file"],
              ["transcript", t("Transcript", "Přepis"), "list"],
              ["recordings", t("Recordings", "Nahrávky"), "headphones"],
              ["actions", t("Action items", "Úkoly"), "check"],
            ].map(([key, label]) => (
              <button
                className={tab === key ? "active" : ""}
                key={key}
                onClick={() => setTab(key)}
              >
                {label}
                {key === "actions" && (
                  <span className="count-badge">{actions.length}</span>
                )}
                {key === "recordings" && (
                  <span className="count-badge">{call.recordings.length}</span>
                )}
              </button>
            ))}
          </div>
          {tab === "notes" || tab === "transcript" ? (
            <Card className="call-notes-card">
              <div className="section-heading">
                <h2>
                  {tab === "notes"
                    ? t("The useful bits", "To podstatné")
                    : t("The conversation", "Rozhovor")}
                </h2>
                {editing ? (
                  <div className="heading-actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(false);
                        setNotes(call.notes);
                        setTranscript(call.transcript);
                        setTitle(call.title);
                      }}
                    >
                      {t("Cancel", "Zrušit")}
                    </Button>
                    <Button
                      disabled={!title.trim()}
                      onClick={() => {
                        updateCall(id, {
                          title: title.trim(),
                          notes,
                          transcript,
                        });
                        setEditing(false);
                        notify(t("Changes saved.", "Změny uloženy."));
                      }}
                    >
                      {t("Save", "Uložit")}
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => setEditing(true)}>
                    {t("Edit", "Upravit")}
                  </Button>
                )}
              </div>
              {editing ? (
                <textarea
                  className="notes-editor"
                  aria-label={tab === "notes" ? "Notes" : "Transcript"}
                  rows={18}
                  value={tab === "notes" ? notes : transcript}
                  onChange={(e) =>
                    tab === "notes"
                      ? setNotes(e.target.value)
                      : setTranscript(e.target.value)
                  }
                />
              ) : tab === "notes" ? (
                call.notes ? (
                  <Notes text={call.notes} />
                ) : (
                  <EmptyState
                    title={t(
                      "Room for your notes.",
                      "Místo pro vaše poznámky.",
                    )}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => setEditing(true)}
                    >
                      {t("Add notes", "Přidat poznámky")}
                    </Button>
                  </EmptyState>
                )
              ) : (
                <div className="transcript-text">
                  {call.transcript ||
                    t(
                      "No transcript yet. Choose Edit to add one.",
                      "Zatím bez přepisu. Přidejte ho tlačítkem Upravit.",
                    )}
                </div>
              )}
              {tab === "notes" && call.transcript && !editing && (
                <div className="notes-regenerate">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setNotes(
                        draftNotes(
                          call.transcript,
                          call.language.startsWith("cs") ? "cs" : "en",
                        ).notes,
                      );
                      setEditing(true);
                    }}
                  >
                    <Icon name="sparkles" size={15} />
                    {t(
                      "Draft notes from transcript",
                      "Návrh poznámek z přepisu",
                    )}
                  </Button>
                  <span className="small muted">
                    {t(
                      "Review the draft before saving.",
                      "Před uložením zkontrolujte návrh.",
                    )}
                  </span>
                </div>
              )}
            </Card>
          ) : tab === "recordings" ? (
            <div className="saved-recordings">
              {call.recordings.length ? (
                call.recordings.map((r) => (
                  <SavedAudio recording={r} key={r.id} />
                ))
              ) : (
                <EmptyState
                  title={t(
                    "This sample call has no audio file.",
                    "Tento ukázkový hovor nemá zvukový soubor.",
                  )}
                >
                  <a
                    className="button button-primary"
                    href={`/${workspace.id}/recording`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="mic" size={17} />
                    {t("Record your own call", "Nahrajte vlastní hovor")}
                  </a>
                </EmptyState>
              )}
            </div>
          ) : (
            <Actions onOpen={onAction} callId={id} />
          )}
        </div>
        <aside className="call-detail-aside">
          <Card>
            <span className="eyebrow">{t("AT A GLANCE", "V KOSTCE")}</span>
            <p className="detail-summary">{call.summary}</p>
            <div className="summary-line">
              <span>{t("Action items", "Úkoly")}</span>
              <strong>{actions.length}</strong>
            </div>
            <div className="summary-line">
              <span>{t("Completed", "Dokončeno")}</span>
              <strong>{actions.filter((a) => a.completed).length}</strong>
            </div>
            <div className="progress-track">
              <span
                style={{
                  width: `${actions.length ? (actions.filter((a) => a.completed).length / actions.length) * 100 : 0}%`,
                }}
              />
            </div>
          </Card>
          <div className="detail-local-note">
            <Icon name="lock" size={15} />
            {t("This call belongs to", "Tento hovor patří do")}
            <Link href={`/${workspace.id}`}>{workspace.name}</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
