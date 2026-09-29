"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AudioLines,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  Link2,
  ListTodo,
  LoaderCircle,
  Mic,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useMinute } from "./minute-provider";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { EmptyState, SectionHeading, StatusBadge } from "./shared";
import { Markdown, EntityChip } from "./entity-chip";
import { RecordingItem } from "./recording-item";
import { TranscriptPanel } from "./transcript-panel";
import { MeetingPeople } from "./meeting-people";
import { TodoRow } from "./todo-row";
import { MeetingDialog } from "./forms/meeting-dialog";
import { TodoDialog } from "./forms/todo-dialog";
import { mutate } from "@/lib/store";
import { deleteRecordings } from "@/lib/media";
import { useMeetingProcessing } from "@/lib/use-meeting-processing";
import { dateLabel, downloadText, timeLabel } from "@/lib/utils";
import type { Meeting, Workspace } from "@/lib/types";

export function MeetingDetail({ meeting, workspace }: { meeting: Meeting; workspace: Workspace }) {
  const { state, t, notify } = useMinute();
  const mutateAccount = (updater: Parameters<typeof mutate>[0]) => mutate(updater, state.user.id);
  const router = useRouter();
  const [tab, setTab] = useState("summary");
  const [dialog, setDialog] = useState<"edit" | "delete" | "todo" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const processing = useMeetingProcessing(meeting);
  const todos = state.todos.filter((item) => item.meetingIds.includes(meeting.id));
  const tabs = [
    { id: "summary", icon: Sparkles, label: t("Overview", "Přehled") },
    { id: "transcript", icon: FileText, label: t("Transcript", "Přepis") },
    { id: "todos", icon: ListTodo, label: t("Todos", "Úkoly"), count: todos.length },
    { id: "recordings", icon: AudioLines, label: t("Recordings", "Nahrávky"), count: meeting.recordings.length },
  ];
  function exportMeeting() {
    const content = `# ${meeting.title}\n\n${new Date(meeting.date).toLocaleString()}\n\n${meeting.participants.join(", ")}\n\n${meeting.description}\n\n## ${t("Summary", "Shrnutí")}\n\n${meeting.transcript?.summary ?? ""}\n\n## ${t("Transcript", "Přepis")}\n\n${meeting.transcript?.text ?? ""}\n\n## ${t("Todos", "Úkoly")}\n\n${todos.map((todo) => `- [${todo.completed ? "x" : " "}] ${todo.title}${todo.dueDate ? ` (${todo.dueDate})` : ""}`).join("\n")}`;
    downloadText(`${meeting.title.replace(/[^a-zA-Z0-9À-ž -]/g, "")}.md`, content);
  }
  return (
    <>
      <Link className="back-link" href={`/${workspace.id}/meetings`}>
        <ArrowLeft size={16} />
        {t("Back to meetings", "Zpět na schůzky")}
      </Link>
      <div className="detail-heading">
        <StatusBadge status={meeting.status} />
        <h1>{meeting.title}</h1>
        <div className="meeting-detail-meta">
          <span>
            <CalendarDays size={15} />
            {dateLabel(meeting.date, state.user.language, false)} · {timeLabel(meeting.date, state.user.language)}
          </span>
          <span>
            <Clock3 size={15} />
            {meeting.duration} min
          </span>
          <span>
            <Users size={15} />
            {meeting.participants.length} {t("participants", "účastníků")}
          </span>
        </div>
        <div className="detail-actions">
          <Link className="button button-primary" href={`/${workspace.id}/meetings/${meeting.id}/studio`}>
            <Mic size={16} />
            {t("Open meeting studio", "Otevřít studio")}
          </Link>
          <Button variant="secondary" onClick={() => setDialog("edit")}>
            <Pencil size={15} />
            {t("Edit", "Upravit")}
          </Button>
          <button
            className="icon-button"
            onClick={exportMeeting}
            aria-label={t("Export meeting", "Exportovat schůzku")}
            title={t("Export as Markdown", "Exportovat jako Markdown")}
          >
            <Download size={17} />
          </button>
          <button
            className="icon-button"
            title={t("Copy link", "Kopírovat odkaz")}
            aria-label={t("Copy meeting link", "Kopírovat odkaz na schůzku")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                notify(t("Meeting link copied", "Odkaz na schůzku zkopírován"));
              } catch {
                notify(t("Copy the URL from your address bar.", "Zkopírujte URL z adresního řádku."));
              }
            }}
          >
            <Link2 size={18} />
          </button>
          <button
            className="icon-button danger"
            disabled={processing.busy}
            onClick={() => setDialog("delete")}
            aria-label={t("Delete meeting", "Smazat schůzku")}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-tabs">
            {tabs.map((item) => (
              <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
                <item.icon size={16} />
                {item.label}
                {item.count !== undefined && <span>{item.count}</span>}
              </button>
            ))}
          </div>
          {processing.busy && (
            <div className="info-banner">
              <LoaderCircle size={17} className="spin" />
              {processing.progress}
            </div>
          )}
          {processing.error && (
            <div className="error-banner" role="alert">
              {processing.error}
            </div>
          )}
          {tab === "summary" && (
            <section className="detail-card">
              <h2>
                <Sparkles size={18} className="teal-text" />
                {t("The big picture", "To podstatné")}
              </h2>
              {meeting.transcript?.summary ? (
                <Markdown>{meeting.transcript.summary}</Markdown>
              ) : (
                <div className="summary-placeholder">
                  <Sparkles size={28} />
                  <h3>{t("Good things are worth remembering.", "Dobré věci stojí za zapamatování.")}</h3>
                  <p>
                    {t(
                      "Finish your meeting to get a summary and clear next steps.",
                      "Dokončete schůzku a získejte shrnutí a jasné další kroky.",
                    )}
                  </p>
                  {(meeting.transcript?.text || !!meeting.recordings.length) && (
                    <Button disabled={processing.busy} onClick={processing.process}>
                      <Sparkles size={16} />
                      {t("Generate summary & todos", "Vytvořit shrnutí a úkoly")}
                    </Button>
                  )}
                </div>
              )}
              {meeting.description && (
                <div className="meeting-description">
                  <h3>{t("Meeting notes", "Poznámky ke schůzce")}</h3>
                  <Markdown>{meeting.description}</Markdown>
                </div>
              )}
              {todos.length > 0 && (
                <>
                  <SectionHeading title={t("Next steps", "Další kroky")} count={todos.length}>
                    <button className="text-link" onClick={() => setTab("todos")}>
                      {t("View todos", "Zobrazit úkoly")}
                    </button>
                  </SectionHeading>
                  <div className="summary-todos">
                    {todos.slice(0, 4).map((todo) => (
                      <EntityChip type="todo" key={todo.id} id={todo.id} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
          {tab === "transcript" && <TranscriptPanel meeting={meeting} processing={processing} />}
          {tab === "todos" && (
            <section>
              <SectionHeading title={t("From words to next steps", "Od slov k dalším krokům")}>
                <Button variant="secondary" onClick={() => setDialog("todo")}>
                  <Plus size={15} />
                  {t("Add todo", "Přidat úkol")}
                </Button>
              </SectionHeading>
              <div className="todo-panel">
                {todos.length ? (
                  todos.map((todo) => <TodoRow key={todo.id} todo={todo} />)
                ) : (
                  <EmptyState
                    type="todo"
                    title={t("No next steps just yet", "Zatím žádné další kroky")}
                    description={t(
                      "Todos from this meeting will appear here. You can also add your own.",
                      "Zde se zobrazí úkoly z této schůzky. Můžete přidat i vlastní.",
                    )}
                    action={t("Add todo", "Přidat úkol")}
                    onAction={() => setDialog("todo")}
                  />
                )}
              </div>
            </section>
          )}
          {tab === "recordings" && (
            <section className="recordings-list">
              {meeting.recordings.length ? (
                meeting.recordings.map((recording) => <RecordingItem key={recording.id} recording={recording} />)
              ) : (
                <div className="detail-card">
                  <EmptyState
                    title={t("A place for every recording", "Místo pro každou nahrávku")}
                    description={t(
                      "Open the studio to record or upload audio.",
                      "Otevřete studio a nahrávejte nebo přidejte zvukový soubor.",
                    )}
                    action={t("Open studio", "Otevřít studio")}
                    onAction={() => router.push(`/${workspace.id}/meetings/${meeting.id}/studio`)}
                  />
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="detail-card properties-card">
          <h2>{t("In this meeting", "Na této schůzce")}</h2>
          <MeetingPeople meeting={meeting} />
          <div className="property-block">
            <span>{t("Workspace", "Pracovní prostor")}</span>
            <EntityChip type="workspace" id={workspace.id} />
          </div>
          <div className="privacy-note">
            <span className="tiny-dot" />
            {t("Saved to your account", "Uloženo ve vašem účtu")}
          </div>
        </aside>
      </div>
      {dialog === "edit" && <MeetingDialog meeting={meeting} workspace={workspace} onClose={() => setDialog(null)} />}
      {dialog === "todo" && <TodoDialog workspaceId={workspace.id} meetingId={meeting.id} onClose={() => setDialog(null)} />}
      {dialog === "delete" && (
        <Modal
          title={t("Delete this meeting?", "Smazat tuto schůzku?")}
          subtitle={t(
            "The transcript and recordings will be deleted. Linked todos will stay in your workspace.",
            "Přepis a nahrávky budou odstraněny. Propojené úkoly zůstanou v prostoru.",
          )}
          onClose={() => {
            if (!deleting) setDialog(null);
          }}
        >
          <div className="modal-actions">
            <Button variant="secondary" disabled={deleting} onClick={() => setDialog(null)}>
              {t("Cancel", "Zrušit")}
            </Button>
            <Button
              className="button-danger"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteRecordings(meeting.recordings.map((item) => item.id));
                  mutateAccount((current) => ({
                    ...current,
                    meetings: current.meetings.filter((item) => item.id !== meeting.id),
                    todos: current.todos.map((todo) => ({ ...todo, meetingIds: todo.meetingIds.filter((id) => id !== meeting.id) })),
                  }));
                  router.push(`/${workspace.id}/meetings`);
                  notify(t("Meeting deleted", "Schůzka smazána"));
                } catch {
                  notify(t("Could not delete recordings. Please try again.", "Nahrávky nelze smazat. Zkuste to znovu."));
                  setDeleting(false);
                }
              }}
            >
              {deleting ? t("Deleting…", "Mažu…") : t("Delete meeting", "Smazat schůzku")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
