"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { loadAudio } from "@/lib/audio-storage";
import { meetingMarkdown, type Meeting } from "@/lib/meetings";

export function MeetingDetail({
  meeting,
  onClose,
  onToggleTask,
  onStar,
  onDelete,
  notify,
}: {
  meeting: Meeting;
  onClose: () => void;
  onToggleTask: (meetingId: string, taskId: string) => void;
  onStar: (id: string) => void;
  onDelete: (id: string) => void;
  notify: (message: string) => void;
}) {
  const [tab, setTab] = useState("notes");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioExtension, setAudioExtension] = useState("webm");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  useEffect(() => {
    let live = true;
    let url: string | undefined;
    if (meeting.hasAudio)
      loadAudio(meeting.id)
        .then((blob) => {
          if (blob && live) {
            url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setAudioExtension(
              blob.type.includes("mp4") || blob.type.includes("m4a")
                ? "m4a"
                : blob.type.includes("mpeg")
                  ? "mp3"
                  : blob.type.includes("wav")
                    ? "wav"
                    : "webm",
            );
          }
        })
        .catch(() =>
          notify("The saved audio couldn’t be loaded in this browser."),
        );
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [meeting.id, meeting.hasAudio, notify]);

  function exportNotes() {
    const url = URL.createObjectURL(
      new Blob([meetingMarkdown(meeting)], {
        type: "text/markdown;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${meeting.title.replace(/[^\p{L}\p{N}\s-]/gu, "").trim() || "meeting"}.md`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Meeting notes exported.");
  }

  return (
    <Modal title={meeting.title} onClose={onClose} className="detail-modal">
      <div className="detail-topline">
        <span className={`category category-${meeting.category.toLowerCase()}`}>
          {meeting.category}
        </span>
        {meeting.sample && <span className="sample-label">Sample meeting</span>}
      </div>
      <h2>{meeting.title}</h2>
      <div className="detail-meta">
        <span>
          <Icon name="calendar" size={15} />
          {new Date(meeting.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {meeting.duration > 0 && (
          <span>
            <Icon name="clock" size={15} />
            {Math.ceil(meeting.duration / 60)} min
          </span>
        )}
        <span>{meeting.participants.join(", ") || "Your meeting"}</span>
      </div>
      <div className="detail-actions">
        <Button variant="secondary" onClick={exportNotes}>
          <Icon name="download" size={16} />
          Export notes
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(meetingMarkdown(meeting));
              notify("Meeting notes copied to clipboard.");
            } catch {
              notify(
                "Clipboard access is unavailable. Use Export notes instead.",
              );
            }
          }}
        >
          <Icon name="copy" size={16} />
          Copy
        </Button>
        <button
          className={`icon-button ${meeting.starred ? "is-starred" : ""}`}
          aria-label={
            meeting.starred ? "Remove from favorites" : "Add to favorites"
          }
          onClick={() => onStar(meeting.id)}
        >
          <Icon name="star" />
        </button>
      </div>
      {audioUrl && (
        <div className="detail-audio">
          <Icon name="headphones" size={19} />
          <audio controls src={audioUrl} className="audio-player" />
          <a
            href={audioUrl}
            download={`${meeting.title}.${audioExtension}`}
            className="icon-button"
            aria-label="Download recording"
          >
            <Icon name="download" size={18} />
          </a>
        </div>
      )}
      <div className="detail-tabs" role="tablist" aria-label="Meeting content">
        {["notes", "transcript", "actions"].map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={tab === name}
            className={tab === name ? "selected" : ""}
            onClick={() => setTab(name)}
          >
            {name === "notes"
              ? "Meeting notes"
              : name === "transcript"
                ? "Transcript"
                : `Action items (${meeting.tasks.length})`}
          </button>
        ))}
      </div>
      <div className="detail-content" role="tabpanel">
        {tab === "notes" && (
          <>
            <section className="summary-box">
              <div className="section-kicker">
                <Icon name="sparkles" size={16} />
                THE BIG PICTURE
              </div>
              <p>{meeting.summary}</p>
            </section>
            <h3>Key takeaways</h3>
            <ul className="takeaway-list">
              {meeting.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
            {meeting.decisions.length > 0 && (
              <>
                <h3>Decisions made</h3>
                <ul className="decision-list">
                  {meeting.decisions.map((decision, index) => (
                    <li key={index}>
                      <Icon name="checkCircle" size={18} />
                      {decision}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="notes-ai-label">
              <Icon name="sparkles" size={14} />
              AI-generated notes. Give them a quick review.
            </div>
          </>
        )}
        {tab === "transcript" && (
          <div className="transcript-text">{meeting.transcript}</div>
        )}
        {tab === "actions" &&
          (meeting.tasks.length ? (
            <div className="detail-task-list">
              {meeting.tasks.map((task) => (
                <div
                  className={`task-item ${task.completed ? "is-completed" : ""}`}
                  key={task.id}
                >
                  <button
                    className="task-checkbox"
                    aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.text}`}
                    aria-pressed={task.completed}
                    onClick={() => onToggleTask(meeting.id, task.id)}
                  >
                    {task.completed && <Icon name="check" size={13} />}
                  </button>
                  <div>
                    <span className="task-text">{task.text}</span>
                    <div className="task-meta">
                      {task.owner || "Unassigned"}
                      {task.due && <span>· {task.due}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="checkCircle" size={30} />
              <h3>No action items</h3>
              <p>No specific commitments were found in this meeting.</p>
            </div>
          ))}
      </div>
      <div className="detail-footer">
        <span>
          <Icon name="leaf" size={14} />A little clarity, saved for later.
        </span>
        {deleteConfirm ? (
          <div className="button-row">
            <span>Delete this meeting?</span>
            <button
              className="text-button"
              onClick={() => setDeleteConfirm(false)}
            >
              Keep it
            </button>
            <button
              className="text-button danger"
              onClick={() => onDelete(meeting.id)}
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            className="icon-button"
            aria-label="Delete meeting"
            onClick={() => setDeleteConfirm(true)}
          >
            <Icon name="trash" size={17} />
          </button>
        )}
      </div>
    </Modal>
  );
}
