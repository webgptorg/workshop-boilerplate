"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/modal";
import { Recorder } from "@/components/recorder";
import { MeetingDetail } from "@/components/meeting-detail";
import { deleteAudio, saveAudio } from "@/lib/audio-storage";
import { isMeeting, sampleMeetings, type Meeting } from "@/lib/meetings";

type View = "overview" | "meetings" | "actions" | "favorites";
type Filter = "All meetings" | "This week" | "Starred";
const STORAGE_KEY = "minute-workspace-v1";
const navigation: { id: View; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "meetings", label: "All meetings", icon: "meetings" },
  { id: "actions", label: "Action items", icon: "checkCircle" },
  { id: "favorites", label: "Favorites", icon: "star" },
];

function Brand() {
  return (
    <span className="minute-brand">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      minute<span className="brand-period">.</span>
    </span>
  );
}

function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="illustration-wave left-wave">
        {[12, 24, 38, 18, 30, 48, 25, 15].map((height, index) => (
          <i key={index} style={{ height }} />
        ))}
      </div>
      <div className="illustration-wave right-wave">
        {[18, 30, 45, 23, 35, 20, 12].map((height, index) => (
          <i key={index} style={{ height }} />
        ))}
      </div>
      <div className="hero-mic">
        <Icon name="mic" size={43} />
      </div>
      <div className="floating-note">
        <span className="floating-note-icon">
          <Icon name="file" size={18} />
        </span>
        <div>
          <strong>Ideas, captured.</strong>
          <span className="note-line long" />
          <span className="note-line short" />
        </div>
        <Icon name="sparkles" size={14} />
      </div>
      <div className="floating-task">
        <span>
          <Icon name="check" size={13} />
        </span>
        Next steps, sorted.
      </div>
      <svg className="doodle-sparkle" viewBox="0 0 40 40">
        <path
          d="M20 2c0 12-4 18-18 18 14 0 18 5 18 18 0-13 5-18 18-18C25 20 20 14 20 2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="illustration-dot dot-one" />
      <span className="illustration-dot dot-two" />
    </div>
  );
}

function Avatars({ names }: { names: string[] }) {
  return (
    <div className="avatars" aria-label={names.join(", ")}>
      {names.slice(0, 3).map((name, index) => (
        <span
          className={`avatar avatar-${index}`}
          key={`${name}-${index}`}
          title={name}
        >
          {name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
      ))}
      {names.length > 3 && (
        <span className="avatar avatar-more">+{names.length - 3}</span>
      )}
      {names.length === 0 && <span className="avatar avatar-0">Y</span>}
    </div>
  );
}

function MeetingCard({
  meeting,
  onOpen,
  onStar,
}: {
  meeting: Meeting;
  onOpen: () => void;
  onStar: () => void;
}) {
  const remaining = meeting.tasks.filter((task) => !task.completed).length;
  return (
    <Card className="meeting-card">
      <div className="meeting-card-top">
        <span
          className={`meeting-symbol category-${meeting.category.toLowerCase()}`}
        >
          <Icon
            name={
              meeting.category === "Research"
                ? "headphones"
                : meeting.category === "Team"
                  ? "meetings"
                  : "file"
            }
            size={20}
          />
        </span>
        <span className={`category category-${meeting.category.toLowerCase()}`}>
          {meeting.category}
        </span>
        <button
          className={`icon-button star-button ${meeting.starred ? "is-starred" : ""}`}
          aria-label={`${meeting.starred ? "Unfavorite" : "Favorite"} ${meeting.title}`}
          aria-pressed={meeting.starred}
          onClick={onStar}
        >
          <Icon name="star" size={17} />
        </button>
      </div>
      <button className="meeting-open" onClick={onOpen}>
        <h3>{meeting.title}</h3>
        <p>{meeting.summary}</p>
      </button>
      <div className="meeting-metadata">
        <span>
          <Icon name="calendar" size={13} />
          {new Date(meeting.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="metadata-dot">·</span>
        <span>
          <Icon name="clock" size={13} />
          {meeting.duration > 0
            ? `${Math.ceil(meeting.duration / 60)} min`
            : "Transcript"}
        </span>
        <span className="notes-ready">
          <span />
          Notes ready
        </span>
      </div>
      <div className="meeting-card-footer">
        <Avatars names={meeting.participants} />
        <button className="meeting-action-count" onClick={onOpen}>
          <Icon name="checkCircle" size={14} />
          {remaining} action {remaining === 1 ? "item" : "items"}
          <Icon name="chevron" size={13} />
        </button>
      </div>
    </Card>
  );
}

export function Workspace({ today }: { today: string }) {
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [view, setView] = useState<View>("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All meetings");
  const [category, setCategory] = useState("");
  const [recorderMode, setRecorderMode] = useState<
    "record" | "upload" | "transcript" | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [settings, setSettings] = useState(false);
  const [help, setHelp] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Personal workspace");
  const [showSamples, setShowSamples] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listView, setListView] = useState(false);
  const [taskFilter, setTaskFilter] = useState<"open" | "completed" | "all">(
    "open",
  );
  const [newTask, setNewTask] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const notify = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: unknown = JSON.parse(raw);
          if (
            data &&
            typeof data === "object" &&
            "meetings" in data &&
            Array.isArray(data.meetings) &&
            data.meetings.every(isMeeting)
          ) {
            setMeetings(data.meetings);
            if (
              "workspaceName" in data &&
              typeof data.workspaceName === "string"
            )
              setWorkspaceName(data.workspaceName);
            if ("showSamples" in data && typeof data.showSamples === "boolean")
              setShowSamples(data.showSamples);
          } else {
            setStorageError(true);
            notify(
              "Saved workspace data could not be read. Your stored copy has been preserved.",
            );
          }
        }
      } catch {
        setStorageError(true);
        notify(
          "Browser storage is unavailable. Export your notes to keep a copy.",
        );
      }
      setHydrated(true);
    });
  }, [notify]);

  useEffect(() => {
    if (!hydrated || storageError) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ meetings, workspaceName, showSamples }),
      );
    } catch {
      queueMicrotask(() => {
        setStorageError(true);
        notify(
          "Your browser’s storage is full. Export your notes to keep a copy.",
        );
      });
    }
  }, [meetings, workspaceName, showSamples, hydrated, storageError, notify]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);

  const visibleMeetings = meetings.filter(
    (meeting) => showSamples || !meeting.sample,
  );
  const tasks = visibleMeetings.flatMap((meeting) =>
    meeting.tasks.map((task) => ({
      ...task,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
    })),
  );
  const openTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const totalMinutes = Math.round(
    visibleMeetings.reduce((sum, meeting) => sum + meeting.duration, 0) / 60,
  );
  const selected = meetings.find((meeting) => meeting.id === selectedId);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const filteredMeetings = visibleMeetings.filter((meeting) => {
    const matchesSearch =
      `${meeting.title} ${meeting.summary} ${meeting.transcript} ${meeting.tasks.map((task) => task.text).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase());
    return (
      matchesSearch &&
      (!category || meeting.category === category) &&
      (view !== "favorites" || meeting.starred) &&
      (filter !== "Starred" || meeting.starred) &&
      (filter !== "This week" || new Date(meeting.date) >= weekStart)
    );
  });

  function navigate(nextView: View, nextCategory = "") {
    setView(nextView);
    setCategory(nextCategory);
    setFilter("All meetings");
    setQuery("");
    setSidebarOpen(false);
  }
  function toggleTask(meetingId: string, taskId: string) {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              tasks: meeting.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task,
              ),
            }
          : meeting,
      ),
    );
  }
  function toggleStar(id: string) {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === id ? { ...meeting, starred: !meeting.starred } : meeting,
      ),
    );
  }

  async function onCreated(meeting: Meeting, audio?: Blob) {
    let savedAudio = false;
    if (audio) {
      try {
        await saveAudio(meeting.id, audio);
        savedAudio = true;
      } catch {
        notify(
          "Notes are ready. Audio couldn’t be saved because browser storage is unavailable.",
        );
      }
    }
    setMeetings((current) => [
      { ...meeting, hasAudio: savedAudio },
      ...current,
    ]);
    setRecorderMode(null);
    setSelectedId(meeting.id);
    if (!audio || savedAudio)
      notify("A good conversation, all captured. Your notes are ready.");
  }

  function removeMeeting(id: string) {
    setMeetings((current) => current.filter((meeting) => meeting.id !== id));
    setSelectedId(null);
    void deleteAudio(id).catch(() =>
      notify(
        "The meeting was removed, but its audio couldn’t be cleared from browser storage.",
      ),
    );
    notify("Meeting deleted.");
  }

  function addTask() {
    if (!newTask.trim()) return;
    const task = {
      id: crypto.randomUUID(),
      text: newTask.trim(),
      owner: "You",
      due: "",
      completed: false,
    };
    const existing = meetings.find(
      (meeting) => meeting.id === "personal-tasks",
    );
    if (existing)
      setMeetings((current) =>
        current.map((meeting) =>
          meeting.id === existing.id
            ? { ...meeting, tasks: [...meeting.tasks, task] }
            : meeting,
        ),
      );
    else
      setMeetings((current) => [
        {
          id: "personal-tasks",
          title: "Personal notes & reminders",
          date: new Date().toISOString(),
          duration: 0,
          category: "Meeting",
          summary: "Your own next steps, in one place.",
          notes: [],
          decisions: [],
          transcript: "Personal action items added in your workspace.",
          participants: ["You"],
          tasks: [task],
          starred: false,
        },
        ...current,
      ]);
    setNewTask("");
    notify("Action item added.");
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <button
          className="brand-button"
          onClick={() => navigate("overview")}
          aria-label="Minute home"
        >
          <Brand />
        </button>
        <button
          className="workspace-switcher"
          onClick={() => setSettings(true)}
        >
          <span className="workspace-avatar">P</span>
          <span>
            <strong>{workspaceName}</strong>
            <small>Your space for good ideas</small>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <Button
          className="new-meeting-button"
          onClick={() => setRecorderMode("record")}
        >
          <Icon name="plus" size={18} />
          New meeting
        </Button>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id && !category ? "active" : ""}`}
              onClick={() => navigate(item.id)}
              aria-current={view === item.id && !category ? "page" : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === "actions" && openTasks.length > 0 && (
                <span className="nav-count">{openTasks.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-label collection-label">
          COLLECTIONS
          <span>
            <Icon name="grid" size={12} />
          </span>
        </div>
        <nav className="collection-nav" aria-label="Meeting collections">
          {[
            ["Team", "Team catch-ups"],
            ["Design", "Design conversations"],
            ["Project", "Projects & planning"],
          ].map(([value, label]) => (
            <button
              className={`nav-item ${category === value ? "active" : ""}`}
              onClick={() => navigate("meetings", value)}
              key={value}
            >
              <span className={`collection-dot dot-${value.toLowerCase()}`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="presence-card">
            <span className="presence-icon">
              <Icon name="leaf" size={20} />
            </span>
            <strong>Be here. We’ll remember.</strong>
            <p>
              Your best ideas happen when
              <br />
              you’re part of the conversation.
            </p>
            <button onClick={() => setHelp(true)}>
              Meet your new notetaker
              <Icon name="arrow" size={14} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <Icon name="settings" size={18} />
            Settings
          </button>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <Icon name="help" size={18} />A little help
          </button>
          <div className="sidebar-profile">
            <span className="profile-avatar">Y</span>
            <span>
              <strong>Your workspace</strong>
              <small>Made for a clearer day</small>
            </span>
            <span className="profile-online" />
          </div>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <Icon name="home" size={17} />
            <span>Workspace</span>
            <Icon name="chevron" size={12} />
            <strong>
              {category || navigation.find((item) => item.id === view)?.label}
            </strong>
          </div>
          <div className="topbar-right">
            <label className="search-field">
              <Icon name="search" size={16} />
              <input
                ref={searchRef}
                placeholder="Search anything…"
                aria-label="Search meetings"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (view === "actions") setView("meetings");
                }}
              />
              <kbd>⌘ K</kbd>
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </label>
            <span className="topbar-divider" />
            <button
              className="topbar-avatar"
              aria-label="Workspace settings"
              onClick={() => setSettings(true)}
            >
              Y
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">
                A CLEARER MIND. A MORE PRESENT YOU.
              </div>
              <h1>
                {view === "overview"
                  ? "Good conversations. Nothing lost."
                  : view === "actions"
                    ? "Small steps. Meaningful progress."
                    : view === "favorites"
                      ? "The conversations worth keeping."
                      : category
                        ? `${category} conversations.`
                        : "Every conversation, in one place."}
              </h1>
              <p>
                {view === "overview"
                  ? "Your meetings, notes, and next steps. All a little more together."
                  : view === "actions"
                    ? "Turn the things you talked about into the things you get done."
                    : view === "favorites"
                      ? "Your most useful ideas, always close at hand."
                      : "Find an idea, revisit a decision, pick up where you left off."}
              </p>
            </div>
            <div className="today-label">
              <Icon name="calendar" size={15} />
              {new Date(today).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>

          {view === "overview" && !query && (
            <>
              <section className="record-hero">
                <div className="hero-copy">
                  <span className="hero-eyebrow">
                    <span />
                    LESS NOTE-TAKING, MORE BEING THERE
                  </span>
                  <h2>
                    You’re in the conversation.
                    <br />
                    <em>We’re on the notes.</em>
                  </h2>
                  <p>
                    Turn your meetings into clear notes and doable next steps.
                  </p>
                  <div className="hero-buttons">
                    <Button onClick={() => setRecorderMode("record")}>
                      <Icon name="mic" size={17} />
                      Record a meeting
                      <Icon name="arrow" size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setRecorderMode("upload")}
                    >
                      <Icon name="upload" size={16} />
                      Upload audio
                    </Button>
                  </div>
                  <span className="hero-footnote">
                    A good listener. An even better memory.
                  </span>
                </div>
                <HeroIllustration />
              </section>
              <section className="stats-row" aria-label="Workspace statistics">
                <Card className="stat-card">
                  <span className="stat-icon stat-green">
                    <Icon name="meetings" size={20} />
                  </span>
                  <div>
                    <span className="stat-label">Meetings captured</span>
                    <div className="stat-bottom">
                      <strong>
                        {visibleMeetings.length.toString().padStart(2, "0")}
                      </strong>
                      <span>Every detail, remembered</span>
                    </div>
                  </div>
                  <span className="stat-decoration">
                    <Icon name="arrow" size={15} />
                  </span>
                </Card>
                <Card className="stat-card">
                  <span className="stat-icon stat-peach">
                    <Icon name="clock" size={20} />
                  </span>
                  <div>
                    <span className="stat-label">Time in conversation</span>
                    <div className="stat-bottom">
                      <strong>
                        {Math.floor(totalMinutes / 60)}
                        <small>h</small> {totalMinutes % 60}
                        <small>m</small>
                      </strong>
                      <span>Time well spent</span>
                    </div>
                  </div>
                </Card>
                <Card className="stat-card">
                  <span className="stat-icon stat-purple">
                    <Icon name="checkCircle" size={20} />
                  </span>
                  <div>
                    <span className="stat-label">Action items completed</span>
                    <div className="stat-bottom">
                      <strong>
                        {completedTasks.length.toString().padStart(2, "0")}
                        <small> / {tasks.length}</small>
                      </strong>
                      <span>Little steps, big progress</span>
                    </div>
                  </div>
                </Card>
              </section>
            </>
          )}

          {view === "actions" ? (
            <section className="actions-page">
              <div className="section-heading">
                <h2>
                  Your next steps{" "}
                  <span className="count-badge">{openTasks.length}</span>
                </h2>
                <div className="segmented-control">
                  {(["open", "completed", "all"] as const).map((value) => (
                    <button
                      className={taskFilter === value ? "selected" : ""}
                      key={value}
                      onClick={() => setTaskFilter(value)}
                    >
                      {value === "open"
                        ? "To do"
                        : value === "completed"
                          ? "Completed"
                          : "All"}
                    </button>
                  ))}
                </div>
              </div>
              <form
                className="add-task-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  addTask();
                }}
              >
                <Icon name="plus" size={19} />
                <input
                  placeholder="What’s one thing you want to move forward?"
                  aria-label="New action item"
                  value={newTask}
                  maxLength={500}
                  onChange={(event) => setNewTask(event.target.value)}
                />
                <Button disabled={!newTask.trim()} type="submit">
                  Add task
                </Button>
              </form>
              <Card className="all-tasks">
                {tasks
                  .filter(
                    (task) =>
                      taskFilter === "all" ||
                      (taskFilter === "completed"
                        ? task.completed
                        : !task.completed),
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`task-item full-task ${task.completed ? "is-completed" : ""}`}
                    >
                      <button
                        className="task-checkbox"
                        aria-label={`${task.completed ? "Reopen" : "Complete"} ${task.text}`}
                        aria-pressed={task.completed}
                        onClick={() => toggleTask(task.meetingId, task.id)}
                      >
                        {task.completed && <Icon name="check" size={13} />}
                      </button>
                      <div className="full-task-text">
                        <span className="task-text">{task.text}</span>
                        <button
                          className="task-source"
                          onClick={() => setSelectedId(task.meetingId)}
                        >
                          {task.meetingTitle}
                          <Icon name="arrow" size={12} />
                        </button>
                      </div>
                      <span className="task-owner">
                        {task.owner || "Unassigned"}
                      </span>
                      {task.due && <span className="due-tag">{task.due}</span>}
                    </div>
                  ))}
                {tasks.filter(
                  (task) =>
                    taskFilter === "all" ||
                    (taskFilter === "completed"
                      ? task.completed
                      : !task.completed),
                ).length === 0 && (
                  <div className="empty-state">
                    <Icon name="checkCircle" size={32} />
                    <h3>
                      {taskFilter === "completed"
                        ? "A fresh start."
                        : "A little breathing room."}
                    </h3>
                    <p>
                      {taskFilter === "completed"
                        ? "Your finished action items will appear here."
                        : "You’re all caught up. Add a task or capture your next meeting."}
                    </p>
                  </div>
                )}
              </Card>
            </section>
          ) : (
            <div
              className={`content-columns ${view !== "overview" || query ? "single-column" : ""}`}
            >
              <section className="meetings-section">
                <div className="section-heading">
                  <h2>
                    {query
                      ? "Search results"
                      : view === "overview"
                        ? "Recent meetings"
                        : view === "favorites"
                          ? "Your favorites"
                          : category || "Your meetings"}
                    <span className="count-badge">
                      {filteredMeetings.length}
                    </span>
                  </h2>
                  {view === "overview" ? (
                    <button
                      className="text-button"
                      onClick={() => navigate("meetings")}
                    >
                      View all meetings
                      <Icon name="arrow" size={14} />
                    </button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="compact-button"
                      onClick={() => setRecorderMode("record")}
                    >
                      <Icon name="plus" size={15} />
                      New meeting
                    </Button>
                  )}
                </div>
                <div className="meeting-toolbar">
                  <div className="filter-tabs">
                    {(["All meetings", "This week", "Starred"] as const).map(
                      (value) => (
                        <button
                          className={filter === value ? "active" : ""}
                          key={value}
                          onClick={() => setFilter(value)}
                        >
                          {value === "Starred" && (
                            <Icon name="star" size={12} />
                          )}
                          {value}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="view-toggle">
                    <button
                      className={!listView ? "selected" : ""}
                      aria-label="Grid view"
                      aria-pressed={!listView}
                      onClick={() => setListView(false)}
                    >
                      <Icon name="grid" size={15} />
                    </button>
                    <button
                      className={listView ? "selected" : ""}
                      aria-label="List view"
                      aria-pressed={listView}
                      onClick={() => setListView(true)}
                    >
                      <Icon name="list" size={17} />
                    </button>
                  </div>
                </div>
                <div
                  className={`meetings-grid ${listView ? "meetings-list" : ""}`}
                >
                  {filteredMeetings
                    .slice(0, view === "overview" && !query ? 4 : undefined)
                    .map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onOpen={() => setSelectedId(meeting.id)}
                        onStar={() => toggleStar(meeting.id)}
                      />
                    ))}
                </div>
                {filteredMeetings.length === 0 && (
                  <Card className="empty-state">
                    <Icon name={query ? "search" : "meetings"} size={33} />
                    <h3>
                      {query
                        ? "No conversations found."
                        : view === "favorites" || filter === "Starred"
                          ? "Keep a good idea close."
                          : "Your next conversation starts here."}
                    </h3>
                    <p>
                      {query
                        ? "Try a different word, topic, or meeting name."
                        : view === "favorites" || filter === "Starred"
                          ? "Star a meeting to save it in your favorites."
                          : "Record a meeting or upload audio. We’ll take care of the notes."}
                    </p>
                    {!query && (
                      <Button onClick={() => setRecorderMode("record")}>
                        <Icon name="mic" size={16} />
                        Record a meeting
                      </Button>
                    )}
                  </Card>
                )}
                {visibleMeetings.some((meeting) => meeting.sample) && (
                  <div className="sample-notice">
                    <span className="sample-indicator" />A few sample meetings
                    to make yourself at home.
                    <button onClick={() => setShowSamples(false)}>
                      Start fresh
                      <Icon name="arrow" size={12} />
                    </button>
                  </div>
                )}
              </section>

              {view === "overview" && !query && (
                <aside className="action-sidebar">
                  <div className="section-heading">
                    <h2>A little follow-through</h2>
                    <span className="count-badge">{openTasks.length}</span>
                  </div>
                  <Card className="action-card">
                    <div className="action-card-heading">
                      <span className="small-sparkle">
                        <Icon name="sparkles" size={17} />
                      </span>
                      <div>
                        <strong>From words to next steps</strong>
                        <p>The little things that move work forward.</p>
                      </div>
                    </div>
                    <div className="dashboard-tasks">
                      {openTasks.slice(0, 4).map((task, index) => (
                        <div key={task.id} className="task-item">
                          <button
                            className="task-checkbox"
                            aria-label={`Complete ${task.text}`}
                            onClick={() => toggleTask(task.meetingId, task.id)}
                          />
                          <div>
                            <span className="task-text">{task.text}</span>
                            <button
                              className="task-source"
                              onClick={() => setSelectedId(task.meetingId)}
                            >
                              {task.meetingTitle}
                            </button>
                            <div className="task-meta">
                              <span
                                className={`tiny-avatar avatar-${index % 3}`}
                              >
                                {task.owner.slice(0, 1) || "?"}
                              </span>
                              {task.owner || "Unassigned"}
                              {task.due && (
                                <span className="task-due">
                                  <Icon name="calendar" size={11} />
                                  {task.due}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {openTasks.length === 0 && (
                        <div className="empty-state">
                          <Icon name="checkCircle" size={28} />
                          <h3>All caught up.</h3>
                          <p>Take a moment. You’ve earned it.</p>
                        </div>
                      )}
                    </div>
                    <button
                      className="view-actions"
                      onClick={() => navigate("actions")}
                    >
                      View all action items
                      <Icon name="arrow" size={15} />
                    </button>
                  </Card>
                  <div className="thoughtful-note">
                    <Icon name="sparkles" size={17} />
                    <p>
                      Good meetings don’t end
                      <br />
                      when the call does.
                    </p>
                    <span>They turn into something.</span>
                  </div>
                </aside>
              )}
            </div>
          )}
          <footer className="workspace-footer">
            <span>
              <span className={`save-dot ${storageError ? "warning" : ""}`} />
              {storageError
                ? "Changes are only saved in this session"
                : "A little peace of mind. Saved on this device."}
            </span>
            <a href="https://www.ptbk.io/" target="_blank" rel="noreferrer">
              Made with <strong>Promptbook</strong>
              <Icon name="arrow" size={12} />
            </a>
          </footer>
        </main>
      </div>

      {recorderMode && (
        <Recorder
          initialMode={recorderMode}
          onClose={() => setRecorderMode(null)}
          onCreated={onCreated}
        />
      )}
      {selected && (
        <MeetingDetail
          key={selected.id}
          meeting={selected}
          onClose={() => setSelectedId(null)}
          onToggleTask={toggleTask}
          onStar={toggleStar}
          onDelete={removeMeeting}
          notify={notify}
        />
      )}
      {settings && (
        <Modal
          title="Workspace settings"
          onClose={() => setSettings(false)}
          className="settings-modal"
        >
          <div className="dialog-eyebrow">
            <Icon name="settings" size={15} />
            MAKE YOURSELF AT HOME
          </div>
          <h2>Your space, your way.</h2>
          <p className="dialog-description">
            A few little things to make Minute yours.
          </p>
          <label htmlFor="workspace-name" className="field-label">
            Workspace name
          </label>
          <input
            id="workspace-name"
            className="input"
            value={workspaceName}
            maxLength={35}
            onChange={(event) => setWorkspaceName(event.target.value)}
          />
          <label className="settings-toggle">
            <span>
              <strong>Show sample meetings</strong>
              <small>
                A few example conversations to explore the workspace.
              </small>
            </span>
            <input
              type="checkbox"
              checked={showSamples}
              onChange={(event) => setShowSamples(event.target.checked)}
            />
          </label>
          <div className="settings-info">
            <Icon name="leaf" size={22} />
            <div>
              <strong>A personal space for your meetings.</strong>
              <p>
                Notes and recordings stay in this browser. Audio and transcripts
                are sent to OpenAI when you create notes. Export anything you’d
                like to keep elsewhere.
              </p>
            </div>
          </div>
          <Button
            className="generate-button"
            onClick={() => {
              if (!workspaceName.trim()) setWorkspaceName("Personal workspace");
              setSettings(false);
              notify("Workspace preferences saved.");
            }}
          >
            All set
            <Icon name="check" size={16} />
          </Button>
        </Modal>
      )}
      {help && (
        <Modal
          title="A little help"
          onClose={() => setHelp(false)}
          className="help-modal"
        >
          <div className="dialog-eyebrow">
            <Icon name="leaf" size={16} />
            LESS BUSYWORK. MORE BEING THERE.
          </div>
          <h2>Meet your new notetaker.</h2>
          <p className="dialog-description">
            Minute catches the details so you can catch the moment.
          </p>
          <div className="help-steps">
            {[
              [
                "mic",
                "1",
                "Bring the conversation",
                "Record your microphone, upload an audio file up to 24 MB, or paste an existing transcript. For online calls, upload the call recording to include everyone.",
              ],
              [
                "sparkles",
                "2",
                "Find the clarity",
                "Minute turns what was said into a concise summary, key takeaways, and decisions. Your audio is sent to OpenAI when you create notes.",
              ],
              [
                "checkCircle",
                "3",
                "Make the next move",
                "Review action items, tick them off, and revisit your notes anytime. Everything is saved in this browser, and you can export notes as Markdown.",
              ],
            ].map(([icon, number, title, description]) => (
              <div key={number}>
                <span className="help-step-icon">
                  <Icon name={icon as IconName} size={22} />
                </span>
                <section>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </section>
              </div>
            ))}
          </div>
          <Button
            className="generate-button"
            onClick={() => {
              setHelp(false);
              setRecorderMode("record");
            }}
          >
            Let’s capture a conversation
            <Icon name="arrow" size={17} />
          </Button>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="checkCircle" size={18} />
          </span>
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
