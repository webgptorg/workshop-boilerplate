"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/minute-icon";
import { Badge, Button, Card } from "@/components/ui";
import {
  deleteAudio,
  loadAudio,
  loadMeetings,
  saveAudio,
  saveMeetings,
} from "@/lib/meeting-storage";
import {
  createNotes,
  formatDuration,
  formatMeetingDate,
  type Meeting,
} from "@/lib/meetings";
import { useMeetingRecorder } from "@/lib/use-meeting-recorder";

type View = "overview" | "meetings" | "actions" | "record" | "detail";

function Waveform({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`waveform ${active ? "waveform-active" : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: 35 }, (_, index) => (
        <span
          key={index}
          style={{
            height: `${14 + ((index * 17 + index * index * 3) % 52)}%`,
            animationDelay: `${(index % 9) * -0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function MeetingRow({
  meeting,
  onClick,
}: {
  meeting: Meeting;
  onClick: () => void;
}) {
  const count = meeting.actions.filter((action) => !action.done).length;
  return (
    <button className="meeting-row" onClick={onClick}>
      <span className="meeting-row-icon">
        <Icon name="file" size={20} />
      </span>
      <span className="meeting-row-main">
        <strong>{meeting.title}</strong>
        <small>
          {formatMeetingDate(meeting.createdAt)} <span>·</span>{" "}
          {formatDuration(meeting.duration)}
        </small>
      </span>
      {count > 0 && (
        <span className="row-tasks">
          <Icon name="check" size={14} /> {count}{" "}
          {count === 1 ? "task" : "tasks"}
        </span>
      )}
      <Icon name="arrow" size={18} />
    </button>
  );
}

export function MinuteApp() {
  const [view, setView] = useState<View>("overview");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [notice, setNotice] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [newAction, setNewAction] = useState("");

  const recorder = useMeetingRecorder((audio, duration, sourceTranscript) => {
    void createMeeting(audio, duration, sourceTranscript);
  }, setTranscript);
  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedId);
  const openActions = meetings.flatMap((meeting) =>
    meeting.actions
      .filter((action) => !action.done)
      .map((action) => ({ ...action, meeting })),
  );
  const totalMinutes = Math.round(
    meetings.reduce((total, meeting) => total + meeting.duration, 0) / 60,
  );
  const filteredMeetings = meetings.filter((meeting) =>
    `${meeting.title} ${meeting.transcript}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setMeetings(loadMeetings());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      saveMeetings(meetings);
    } catch {
      /* Keep the current session usable if storage is full. */
    }
  }, [meetings, hydrated]);

  useEffect(() => {
    if (!selectedId) return;
    let url: string | null = null;
    let cancelled = false;
    loadAudio(selectedId)
      .then((blob) => {
        if (blob && !cancelled) {
          url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      })
      .catch(() => setAudioUrl(null));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setAudioUrl(null);
    };
  }, [selectedId]);

  async function createMeeting(
    audio?: Blob,
    duration = 0,
    sourceTranscript = transcript,
  ) {
    const id = crypto.randomUUID();
    let hasAudio = false;
    if (audio?.size) {
      try {
        await saveAudio(id, audio);
        hasAudio = true;
      } catch {
        setNotice(
          "Audio could not be saved in this browser. Your transcript and notes were saved.",
        );
      }
    }
    const meeting: Meeting = {
      id,
      title: title.trim() || "Untitled meeting",
      createdAt: new Date().toISOString(),
      duration,
      transcript: sourceTranscript.trim(),
      ...createNotes(sourceTranscript.trim()),
      hasAudio,
      audioType: hasAudio ? audio?.type : undefined,
    };
    setMeetings((previous) => [meeting, ...previous]);
    setSelectedId(id);
    setView("detail");
  }

  function updateMeeting(id: string, change: (meeting: Meeting) => Meeting) {
    setMeetings((previous) =>
      previous.map((meeting) =>
        meeting.id === id ? change(meeting) : meeting,
      ),
    );
  }

  async function removeMeeting(meeting: Meeting) {
    if (!window.confirm(`Delete “${meeting.title}” and its recording?`)) return;
    setMeetings((previous) =>
      previous.filter((item) => item.id !== meeting.id),
    );
    if (meeting.hasAudio) await deleteAudio(meeting.id).catch(() => undefined);
    setSelectedId(null);
    setView("meetings");
  }

  function navigate(destination: View) {
    if (recorder.status !== "idle") {
      setNotice("Finish the current recording before leaving this page.");
      return;
    }
    setNotice("");
    setView(destination);
  }

  function beginNewMeeting() {
    if (recorder.status !== "idle") return;
    setTitle("");
    setTranscript("");
    recorder.reset();
    setNotice("");
    setView("record");
  }

  const navigation: {
    view: View;
    icon: IconName;
    label: string;
    count?: number;
  }[] = [
    { view: "overview", icon: "grid", label: "Overview" },
    {
      view: "meetings",
      icon: "file",
      label: "Meetings",
      count: meetings.length,
    },
    {
      view: "actions",
      icon: "check",
      label: "Action items",
      count: openActions.length,
    },
  ];

  return (
    <div className="minute-shell">
      <aside className="sidebar">
        <div>
          <button
            className="minute-brand"
            onClick={() => navigate("overview")}
            aria-label="Minute overview"
          >
            <span className="minute-mark">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>
              minute<span className="brand-period">.</span>
            </span>
          </button>
          <span className="sidebar-eyebrow">WORKSPACE</span>
          <nav className="sidebar-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <button
                key={item.view}
                className={`nav-item ${view === item.view || (view === "detail" && item.view === "meetings") ? "nav-item-active" : ""}`}
                onClick={() => navigate(item.view)}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="nav-count">{item.count}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <Button className="sidebar-record" onClick={beginNewMeeting}>
            <Icon name="plus" size={18} /> New meeting
          </Button>
        </div>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span className="privacy-icon">
              <Icon name="headphones" size={18} />
            </span>
            <strong>Your space, your notes</strong>
            <p>Meetings and recordings are saved in this browser.</p>
          </div>
          <div className="sidebar-footer">
            <span className="footer-dot" /> Made with Promptbook
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {view === "detail"
                ? "Meeting notes"
                : view === "record"
                  ? "New meeting"
                  : view === "actions"
                    ? "Action items"
                    : view === "meetings"
                      ? "Meetings"
                      : "Overview"}
            </strong>
          </div>
          <div className="header-right">
            <span className="header-date">
              {new Intl.DateTimeFormat("en", {
                weekday: "short",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </span>
            <span className="avatar">M</span>
          </div>
        </header>
        <main className="workspace-main">
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button onClick={() => setNotice("")} aria-label="Dismiss notice">
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          {view === "overview" && (
            <>
              <div className="page-intro">
                <div>
                  <div className="eyebrow">
                    YOUR WORKSPACE <span className="eyebrow-line" />
                  </div>
                  <h1>
                    Make every meeting
                    <br />
                    <em>mean something.</em>
                  </h1>
                  <p>Capture the conversation. Leave with clarity.</p>
                </div>
                <div className="intro-spark">
                  <Icon name="spark" size={22} />
                </div>
              </div>
              <section className="hero-card">
                <div className="hero-content">
                  <span className="hero-kicker">
                    <span className="live-dot" /> READY WHEN YOU ARE
                  </span>
                  <h2>
                    Good conversations
                    <br />
                    deserve great follow-through.
                  </h2>
                  <p>
                    Record a meeting and turn the transcript into a clear
                    summary and action items.
                  </p>
                  <Button className="hero-button" onClick={beginNewMeeting}>
                    <Icon name="mic" size={19} /> Start recording{" "}
                    <Icon name="arrow" size={18} />
                  </Button>
                </div>
                <div className="hero-art">
                  <div className="hero-orbit hero-orbit-one" />
                  <div className="hero-orbit hero-orbit-two" />
                  <div className="hero-mic">
                    <Icon name="mic" size={42} />
                  </div>
                  <Waveform />
                </div>
              </section>
              <section className="stats-grid" aria-label="Workspace statistics">
                <Card className="stat-card">
                  <span className="stat-icon stat-icon-blue">
                    <Icon name="file" />
                  </span>
                  <span className="stat-number">
                    {meetings.length.toString().padStart(2, "0")}
                  </span>
                  <span className="stat-label">Meetings recorded</span>
                </Card>
                <Card className="stat-card">
                  <span className="stat-icon stat-icon-purple">
                    <Icon name="clock" />
                  </span>
                  <span className="stat-number">
                    {totalMinutes.toString().padStart(2, "0")}
                  </span>
                  <span className="stat-label">Minutes captured</span>
                </Card>
                <Card className="stat-card">
                  <span className="stat-icon stat-icon-green">
                    <Icon name="check" />
                  </span>
                  <span className="stat-number">
                    {openActions.length.toString().padStart(2, "0")}
                  </span>
                  <span className="stat-label">Open action items</span>
                </Card>
              </section>
              <div className="overview-grid">
                <section className="section-panel recent-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Recent meetings</h2>
                      <p>Pick up right where you left off.</p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => navigate("meetings")}
                    >
                      View all <Icon name="arrow" size={16} />
                    </button>
                  </div>
                  {meetings.length ? (
                    <div className="meeting-list">
                      {meetings.slice(0, 3).map((meeting) => (
                        <MeetingRow
                          key={meeting.id}
                          meeting={meeting}
                          onClick={() => {
                            setSelectedId(meeting.id);
                            setView("detail");
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-recent">
                      <div className="empty-icon">
                        <Icon name="mic" size={23} />
                      </div>
                      <strong>Your meeting library starts here</strong>
                      <p>
                        Record your first meeting to see its notes, recording,
                        and action items here.
                      </p>
                      <button
                        className="inline-button"
                        onClick={beginNewMeeting}
                      >
                        Record a meeting <Icon name="arrow" size={15} />
                      </button>
                    </div>
                  )}
                </section>
                <section className="how-panel">
                  <span className="how-eyebrow">A BETTER WAY TO MEET</span>
                  <h2>
                    From conversation
                    <br />
                    to momentum.
                  </h2>
                  <div className="how-steps">
                    <div>
                      <span>01</span>
                      <p>
                        <strong>Record</strong>
                        <small>Capture the moment as it happens.</small>
                      </p>
                    </div>
                    <div>
                      <span>02</span>
                      <p>
                        <strong>Review</strong>
                        <small>Refine your transcript and notes.</small>
                      </p>
                    </div>
                    <div>
                      <span>03</span>
                      <p>
                        <strong>Follow through</strong>
                        <small>Keep every next step in sight.</small>
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {view === "record" && (
            <>
              <div className="page-heading">
                <button
                  className="back-button"
                  onClick={() => navigate("overview")}
                >
                  <Icon name="back" size={18} /> Back to overview
                </button>
                <div className="eyebrow">
                  NEW MEETING <span className="eyebrow-line" />
                </div>
                <h1>Capture the moment.</h1>
                <p>
                  Start recording, then review the transcript to create your
                  notes.
                </p>
              </div>
              <div className="record-grid">
                <div className="record-main">
                  <Card className="recorder-card">
                    <div className="recorder-top">
                      <span
                        className={`record-status ${recorder.status === "recording" ? "record-status-live" : ""}`}
                      >
                        <span className="status-dot" />
                        {recorder.status === "requesting"
                          ? "ALLOW MICROPHONE"
                          : recorder.status === "recording"
                            ? "RECORDING"
                            : recorder.status === "paused"
                              ? "PAUSED"
                              : recorder.status === "saving"
                                ? "SAVING"
                                : "READY TO RECORD"}
                      </span>
                      <span className="record-time">
                        {formatDuration(recorder.seconds)}
                      </span>
                    </div>
                    <div className="recorder-visual">
                      <div className="record-center">
                        <Icon name="mic" size={31} />
                      </div>
                      <Waveform active={recorder.status === "recording"} />
                    </div>
                    <div className="recorder-controls">
                      {recorder.status === "idle" && (
                        <Button
                          className="record-primary"
                          onClick={() => void recorder.start()}
                        >
                          <Icon name="mic" size={18} /> Start recording
                        </Button>
                      )}
                      {recorder.status === "requesting" && (
                        <span className="processing-label">
                          Waiting for microphone access…
                        </span>
                      )}
                      {recorder.status === "recording" && (
                        <>
                          <Button variant="secondary" onClick={recorder.pause}>
                            <Icon name="pause" size={17} /> Pause
                          </Button>
                          <Button
                            className="stop-button"
                            onClick={recorder.stop}
                          >
                            <Icon name="stop" size={15} /> Finish recording
                          </Button>
                        </>
                      )}
                      {recorder.status === "paused" && (
                        <>
                          <Button variant="secondary" onClick={recorder.resume}>
                            <Icon name="play" size={16} /> Resume
                          </Button>
                          <Button
                            className="stop-button"
                            onClick={recorder.stop}
                          >
                            <Icon name="stop" size={15} /> Finish recording
                          </Button>
                        </>
                      )}
                      {recorder.status === "saving" && (
                        <span className="processing-label">
                          Saving your meeting…
                        </span>
                      )}
                    </div>
                    <p className="recorder-hint">
                      Recordings are saved here. Live transcription may use your
                      browser’s speech service.
                    </p>
                  </Card>
                  <div className="transcript-section">
                    <div className="section-heading">
                      <div>
                        <h2>Transcript</h2>
                        <p>
                          Live transcription appears here when supported. You
                          can edit it anytime.
                        </p>
                      </div>
                      <Badge tone="neutral">EDITABLE</Badge>
                    </div>
                    <textarea
                      className="transcript-input"
                      aria-label="Meeting transcript"
                      placeholder="Your conversation will appear here. You can also type or paste meeting notes to generate a summary and action items…"
                      value={transcript}
                      onChange={(event) => {
                        setTranscript(event.target.value);
                        recorder.setTranscript(event.target.value);
                      }}
                    />
                    {recorder.interim && (
                      <p className="interim-text">
                        Listening: {recorder.interim}
                      </p>
                    )}
                    {recorder.message && (
                      <p className="helper-note">{recorder.message}</p>
                    )}
                  </div>
                </div>
                <div className="record-side">
                  <Card className="meeting-details-card">
                    <h3>Meeting details</h3>
                    <label className="field-label" htmlFor="meeting-title">
                      Meeting name
                    </label>
                    <input
                      id="meeting-title"
                      className="text-input"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Weekly product sync"
                    />
                    <div className="detail-separator" />
                    <div className="detail-meta">
                      <Icon name="clock" size={18} />
                      <span>{formatMeetingDate(new Date().toISOString())}</span>
                    </div>
                  </Card>
                  <div className="record-tip">
                    <span className="tip-icon">
                      <Icon name="spark" size={20} />
                    </span>
                    <h3>Notes, ready when you are.</h3>
                    <p>
                      When you finish, Minute pulls key points and next steps
                      from the transcript. You can edit everything afterward.
                    </p>
                  </div>
                  {recorder.status === "idle" && (
                    <button
                      className="manual-save"
                      disabled={!transcript.trim()}
                      onClick={() => void createMeeting()}
                    >
                      Already have a transcript? Create notes{" "}
                      <Icon name="arrow" size={16} />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {view === "meetings" && (
            <>
              <div className="page-heading list-heading">
                <div className="eyebrow">
                  YOUR LIBRARY <span className="eyebrow-line" />
                </div>
                <div className="heading-action">
                  <div>
                    <h1>
                      All meetings<span className="heading-dot">.</span>
                    </h1>
                    <p>Every conversation, neatly in one place.</p>
                  </div>
                  <Button className="top-new-button" onClick={beginNewMeeting}>
                    <Icon name="plus" size={18} /> New meeting
                  </Button>
                </div>
              </div>
              <div className="list-toolbar">
                <div className="search-box">
                  <Icon name="search" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search meetings"
                    aria-label="Search meetings"
                  />
                </div>
                <span>
                  {filteredMeetings.length}{" "}
                  {filteredMeetings.length === 1 ? "meeting" : "meetings"}
                </span>
              </div>
              <Card className="library-card">
                {filteredMeetings.length ? (
                  filteredMeetings.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      onClick={() => {
                        setSelectedId(meeting.id);
                        setView("detail");
                      }}
                    />
                  ))
                ) : (
                  <div className="library-empty">
                    <span className="empty-icon">
                      <Icon name="file" size={25} />
                    </span>
                    <h2>{search ? "No meetings found" : "No meetings yet"}</h2>
                    <p>
                      {search
                        ? "Try another search term."
                        : "Your recorded meetings will show up here."}
                    </p>
                    {!search && (
                      <Button onClick={beginNewMeeting}>
                        <Icon name="mic" size={17} /> Record your first meeting
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </>
          )}

          {view === "actions" && (
            <>
              <div className="page-heading list-heading">
                <div className="eyebrow">
                  STAY ON TRACK <span className="eyebrow-line" />
                </div>
                <h1>
                  Action items<span className="heading-dot">.</span>
                </h1>
                <p>All your next steps, gathered in one place.</p>
              </div>
              <div className="action-summary">
                <span className="stat-icon stat-icon-green">
                  <Icon name="check" />
                </span>
                <div>
                  <strong>
                    {openActions.length} open{" "}
                    {openActions.length === 1 ? "task" : "tasks"}
                  </strong>
                  <p>Small steps keep big ideas moving.</p>
                </div>
              </div>
              <Card className="action-list-card">
                {meetings.some((meeting) => meeting.actions.length) ? (
                  meetings.map((meeting) =>
                    meeting.actions.length ? (
                      <div className="action-group" key={meeting.id}>
                        <button
                          className="action-group-title"
                          onClick={() => {
                            setSelectedId(meeting.id);
                            setView("detail");
                          }}
                        >
                          {meeting.title} <Icon name="arrow" size={15} />
                        </button>
                        {meeting.actions.map((action) => (
                          <label
                            className={`task-row ${action.done ? "task-done" : ""}`}
                            key={action.id}
                          >
                            <input
                              type="checkbox"
                              checked={action.done}
                              onChange={() =>
                                updateMeeting(meeting.id, (item) => ({
                                  ...item,
                                  actions: item.actions.map((entry) =>
                                    entry.id === action.id
                                      ? { ...entry, done: !entry.done }
                                      : entry,
                                  ),
                                }))
                              }
                            />
                            <span>{action.text}</span>
                          </label>
                        ))}
                      </div>
                    ) : null,
                  )
                ) : (
                  <div className="library-empty">
                    <span className="empty-icon">
                      <Icon name="check" size={25} />
                    </span>
                    <h2>Nothing on your list yet</h2>
                    <p>Action items from your meetings will appear here.</p>
                    <Button onClick={beginNewMeeting}>
                      <Icon name="mic" size={17} /> Start a meeting
                    </Button>
                  </div>
                )}
              </Card>
            </>
          )}

          {view === "detail" && selectedMeeting && (
            <>
              <div className="page-heading detail-heading">
                <button
                  className="back-button"
                  onClick={() => navigate("meetings")}
                >
                  <Icon name="back" size={18} /> All meetings
                </button>
                <div className="detail-title-row">
                  <div>
                    <div className="eyebrow">
                      MEETING NOTES <span className="eyebrow-line" />
                    </div>
                    <input
                      className="detail-title-input"
                      aria-label="Meeting title"
                      value={selectedMeeting.title}
                      onChange={(event) =>
                        updateMeeting(selectedMeeting.id, (meeting) => ({
                          ...meeting,
                          title: event.target.value,
                        }))
                      }
                    />
                    <div className="detail-subtitle">
                      <span>
                        <Icon name="clock" size={15} />{" "}
                        {formatMeetingDate(selectedMeeting.createdAt)}
                      </span>
                      <span className="meta-divider" />
                      <span>
                        {formatDuration(selectedMeeting.duration)} recording
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => void removeMeeting(selectedMeeting)}
                    aria-label="Delete meeting"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-main">
                  <Card className="summary-card">
                    <div className="card-heading">
                      <span className="content-icon content-icon-blue">
                        <Icon name="spark" size={20} />
                      </span>
                      <div>
                        <h2>Meeting summary</h2>
                        <p>The highlights, all in one place.</p>
                      </div>
                    </div>
                    <textarea
                      className="summary-input"
                      aria-label="Meeting summary"
                      placeholder="Add a summary of this meeting…"
                      value={selectedMeeting.summary}
                      onChange={(event) =>
                        updateMeeting(selectedMeeting.id, (meeting) => ({
                          ...meeting,
                          summary: event.target.value,
                        }))
                      }
                    />
                    <button
                      className="regenerate-button"
                      onClick={() =>
                        updateMeeting(selectedMeeting.id, (meeting) => ({
                          ...meeting,
                          ...createNotes(meeting.transcript),
                        }))
                      }
                    >
                      <Icon name="spark" size={15} /> Regenerate from transcript
                    </button>
                  </Card>
                  <Card className="tasks-card">
                    <div className="card-heading">
                      <span className="content-icon content-icon-green">
                        <Icon name="check" size={20} />
                      </span>
                      <div>
                        <h2>Action items</h2>
                        <p>Turn discussion into progress.</p>
                      </div>
                      <Badge tone="green">
                        {selectedMeeting.actions.length}
                      </Badge>
                    </div>
                    {selectedMeeting.actions.length ? (
                      <div className="detail-tasks">
                        {selectedMeeting.actions.map((action) => (
                          <div
                            className={`detail-task ${action.done ? "task-done" : ""}`}
                            key={action.id}
                          >
                            <label>
                              <input
                                type="checkbox"
                                checked={action.done}
                                onChange={() =>
                                  updateMeeting(
                                    selectedMeeting.id,
                                    (meeting) => ({
                                      ...meeting,
                                      actions: meeting.actions.map((item) =>
                                        item.id === action.id
                                          ? { ...item, done: !item.done }
                                          : item,
                                      ),
                                    }),
                                  )
                                }
                              />
                              <span>{action.text}</span>
                            </label>
                            <button
                              onClick={() =>
                                updateMeeting(
                                  selectedMeeting.id,
                                  (meeting) => ({
                                    ...meeting,
                                    actions: meeting.actions.filter(
                                      (item) => item.id !== action.id,
                                    ),
                                  }),
                                )
                              }
                              aria-label={`Remove ${action.text}`}
                            >
                              <Icon name="close" size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-actions">
                        No action items found. Add one below if something needs
                        follow-up.
                      </p>
                    )}
                    <form
                      className="add-task-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!newAction.trim()) return;
                        updateMeeting(selectedMeeting.id, (meeting) => ({
                          ...meeting,
                          actions: [
                            ...meeting.actions,
                            {
                              id: crypto.randomUUID(),
                              text: newAction.trim(),
                              done: false,
                            },
                          ],
                        }));
                        setNewAction("");
                      }}
                    >
                      <input
                        aria-label="New action item"
                        value={newAction}
                        onChange={(event) => setNewAction(event.target.value)}
                        placeholder="Add an action item…"
                      />
                      <button type="submit" aria-label="Add action item">
                        <Icon name="plus" size={18} />
                      </button>
                    </form>
                  </Card>
                  <Card className="detail-transcript-card">
                    <div className="card-heading">
                      <span className="content-icon content-icon-purple">
                        <Icon name="file" size={20} />
                      </span>
                      <div>
                        <h2>Transcript</h2>
                        <p>The full conversation, ready to revisit.</p>
                      </div>
                    </div>
                    <textarea
                      className="detail-transcript"
                      aria-label="Edit transcript"
                      value={selectedMeeting.transcript}
                      placeholder="Add or edit the meeting transcript…"
                      onChange={(event) =>
                        updateMeeting(selectedMeeting.id, (meeting) => ({
                          ...meeting,
                          transcript: event.target.value,
                        }))
                      }
                    />
                  </Card>
                </div>
                <aside className="detail-side">
                  <Card className="audio-card">
                    <div className="side-card-title">
                      <Icon name="headphones" size={20} />
                      <h3>Recording</h3>
                    </div>
                    {selectedMeeting.hasAudio && audioUrl ? (
                      <>
                        <audio
                          controls
                          src={audioUrl}
                          className="audio-player"
                        />
                        <a
                          className="download-link"
                          href={audioUrl}
                          download={`${selectedMeeting.title.replace(/[^a-z0-9-_]+/gi, "-") || "meeting"}.${selectedMeeting.audioType?.includes("mp4") ? "m4a" : selectedMeeting.audioType?.includes("ogg") ? "ogg" : "webm"}`}
                        >
                          <Icon name="download" size={17} /> Download audio
                        </a>
                      </>
                    ) : (
                      <p>
                        {selectedMeeting.hasAudio
                          ? "Loading audio…"
                          : "No audio was saved for this meeting."}
                      </p>
                    )}
                  </Card>
                  <div className="detail-hint">
                    <Icon name="edit" size={17} />
                    <p>
                      Your summary, transcript, and tasks are editable. Changes
                      save automatically.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
