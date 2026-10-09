"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Expand,
  FileText,
  Hash,
  Lightbulb,
  Link2,
  LoaderCircle,
  MoreHorizontal,
  NotebookPen,
  Redo2,
  Shrink,
  Sparkles,
  Star,
  Undo2,
  Users,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollaborativeEditor } from "@/components/collaborative-editor";
import {
  initials,
  replaceText,
  type Identity,
  type SavedRoom,
  type SyncStatus,
} from "@/lib/notes";
import { RoomConnection, type Participant } from "@/lib/room-connection";

type Props = {
  room: SavedRoom;
  identity: Identity;
  onTitle: (id: string, title: string) => void;
  onStar: () => void;
  onShare: () => void;
  onProfile: () => void;
  notify: (message: string) => void;
};

export function RoomWorkspace({
  room,
  identity,
  onTitle,
  onStar,
  onShare,
  onProfile,
  notify,
}: Props) {
  const [connection, setConnection] = useState<RoomConnection | null>(null);
  const connectionRef = useRef<RoomConnection | null>(null);
  const initialIdentity = useRef(identity);
  const openedAt = useRef(room.visited);
  const [status, setStatus] = useState<SyncStatus>("connecting");
  const [storage, setStorage] = useState<"memory" | "supabase">("memory");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [title, setTitle] = useState(room.title);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState(false);
  const [font, setFont] = useState("sans");
  const [size, setSize] = useState(16);
  const [menu, setMenu] = useState(false);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [redoAvailable, setRedoAvailable] = useState(false);
  const [created, setCreated] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const field = titleRef.current;
    if (!field) return;
    const resize = () => {
      field.style.height = "auto";
      field.style.height = `${field.scrollHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [title]);

  useEffect(() => {
    const client = new RoomConnection(
      room.id,
      Boolean(room.welcome),
      initialIdentity.current,
      {
        status: setStatus,
        ready: (mode) => {
          setStorage(mode);
          setConnection(client);
          setCreated(
            new Date(openedAt.current).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            }),
          );
          const newTitle = sessionStorage.getItem(`notes.new-title.${room.id}`);
          if (newTitle) {
            replaceText(client.doc.getText("title"), newTitle);
            sessionStorage.removeItem(`notes.new-title.${room.id}`);
          }
        },
        participants: (users) => {
          queueMicrotask(() => setParticipants(users));
        },
        error: setError,
      },
    );
    connectionRef.current = client;
    const update = () => {
      const nextTitle = client.doc.getText("title").toString();
      setTitle(nextTitle);
      setBody(client.doc.getText("body").toString());
      onTitle(room.id, nextTitle || "Untitled note");
    };
    const updateUndo = () => {
      setUndoAvailable(client.undoManager.canUndo());
      setRedoAvailable(client.undoManager.canRedo());
    };
    client.doc.on("update", update);
    client.undoManager.on("stack-item-added", updateUndo);
    client.undoManager.on("stack-item-popped", updateUndo);
    client.undoManager.on("stack-cleared", updateUndo);
    return () => {
      client.doc.off("update", update);
      client.destroy();
      connectionRef.current = null;
    };
  }, [room.id, room.welcome, onTitle]);

  useEffect(() => {
    connectionRef.current?.setIdentity(identity);
  }, [identity]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [menu]);
  useEffect(() => {
    if (!focus) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocus(false);
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [focus]);

  function exportNote() {
    const blob = new Blob([`${title}\n\n${body}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      title
        .replace(/[^\p{L}\p{N} _-]/gu, "")
        .trim()
        .slice(0, 80) || "note"
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMenu(false);
    notify("A little copy of your thoughts, downloaded.");
  }

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const statusText = {
    connecting: "Connecting…",
    saved: "All changes saved",
    saving: "Saving changes…",
    offline: "Waiting to sync",
  }[status];
  const StatusIcon =
    status === "offline"
      ? WifiOff
      : status === "saved"
        ? CheckCheck
        : LoaderCircle;

  return (
    <main className={`workspace-content ${focus ? "focus-mode" : ""}`}>
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">
            <span />A LITTLE ROOM FOR BIG IDEAS
          </span>
          <h1>
            Good ideas start here<span>.</span>
          </h1>
          <p>Write freely. Think together. Make something good.</p>
        </div>
        <Button className="share-room-button" onClick={onShare}>
          <Link2 size={17} />
          Share room
          <ArrowUpRight size={15} />
        </Button>
      </div>
      {error && (
        <div className="connection-warning" role="status">
          <WifiOff size={16} />
          {error}
        </div>
      )}
      <div className="workspace-grid">
        <div className="writing-column">
          <div className="document-meta">
            <span>
              <span
                className={`live-dot ${status === "offline" ? "offline" : ""}`}
              />
              {status === "offline" ? "Reconnecting" : "Live collaboration"}
            </span>
            <div className="document-actions">
              <span className="mini-avatars">
                {participants.slice(0, 3).map((user) => (
                  <span
                    className="avatar"
                    key={user.id}
                    title={user.name}
                    style={{
                      color: user.color,
                      backgroundColor: user.colorLight,
                    }}
                  >
                    {initials(user.name)}
                  </span>
                ))}
              </span>
              <button
                className={`icon-button star-button ${room.starred ? "is-starred" : ""}`}
                aria-label={room.starred ? "Unstar note" : "Star note"}
                onClick={onStar}
              >
                <Star size={18} fill={room.starred ? "currentColor" : "none"} />
              </button>
              <div className="note-menu" ref={menuRef}>
                <button
                  className="icon-button"
                  aria-label="Note options"
                  aria-expanded={menu}
                  onClick={() => setMenu(!menu)}
                >
                  <MoreHorizontal size={20} />
                </button>
                {menu && (
                  <div className="dropdown-menu">
                    <button onClick={exportNote} disabled={!connection}>
                      <ArrowDownToLine size={16} />
                      Download as text
                    </button>
                    <button
                      onClick={() => {
                        setMenu(false);
                        onShare();
                      }}
                    >
                      <Link2 size={16} />
                      Share room
                    </button>
                    <button
                      onClick={() => {
                        setFocus(!focus);
                        setMenu(false);
                      }}
                    >
                      <Expand size={16} />
                      Focus mode
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Card className="note-paper">
            <div className="editor-toolbar">
              <div className="appearance-control">
                <span className="text-icon">Aa</span>
                <select
                  aria-label="Text appearance"
                  value={font}
                  onChange={(event) => setFont(event.target.value)}
                >
                  <option value="sans">Simple text</option>
                  <option value="serif">Classic serif</option>
                  <option value="mono">Monospace</option>
                </select>
                <ChevronDown size={13} />
              </div>
              <div className="font-size-control">
                <select
                  aria-label="Font size"
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                >
                  {[14, 16, 18, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} />
              </div>
              <span className="toolbar-divider" />
              <button
                className="icon-button"
                aria-label="Undo"
                title="Undo (⌘/Ctrl Z)"
                disabled={!undoAvailable}
                onClick={() => connection?.undoManager.undo()}
              >
                <Undo2 size={16} />
              </button>
              <button
                className="icon-button"
                aria-label="Redo"
                title="Redo (⌘/Ctrl Shift Z)"
                disabled={!redoAvailable}
                onClick={() => connection?.undoManager.redo()}
              >
                <Redo2 size={16} />
              </button>
              <span className="toolbar-right">Just you and your words.</span>
              <button
                className="icon-button focus-button"
                aria-label={focus ? "Exit focus mode" : "Enter focus mode"}
                title={focus ? "Exit focus mode (Esc)" : "Focus mode"}
                onClick={() => setFocus(!focus)}
              >
                {focus ? <Shrink size={16} /> : <Expand size={16} />}
              </button>
            </div>
            <div className="paper-content">
              <div className="note-topline">
                <span className="note-page-icon">
                  <NotebookPen size={25} strokeWidth={1.5} />
                  <Sparkles className="note-sparkle" size={12} />
                </span>
                <span>
                  <Clock3 size={12} />
                  {created ? `Opened ${created}` : "Your shared canvas"}
                </span>
              </div>
              <label className="sr-only" htmlFor="note-title">
                Note title
              </label>
              <textarea
                ref={titleRef}
                rows={1}
                className="note-title"
                id="note-title"
                placeholder="Untitled note"
                aria-label="Note title"
                value={title}
                maxLength={200}
                disabled={!connection}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (connection)
                    replaceText(
                      connection.doc.getText("title"),
                      event.target.value.replace(/\n/g, " "),
                    );
                }}
              />
              {connection ? (
                <CollaborativeEditor
                  connection={connection}
                  font={font}
                  size={size}
                />
              ) : (
                <div className="editor-loading">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
            <div className="paper-footer">
              <span className={`save-status status-${status}`}>
                <StatusIcon
                  size={14}
                  className={
                    status === "connecting" || status === "saving"
                      ? "spinning"
                      : ""
                  }
                />
                {statusText}
              </span>
              <span>
                {words} {words === 1 ? "word" : "words"}
                <span className="footer-separator">·</span>
                {body.length} characters
              </span>
            </div>
          </Card>
          <div className="writing-hint">
            <Lightbulb size={15} />
            <span>
              A thought doesn’t have to be finished to be worth writing down.
            </span>
            <span className="hint-sparkle">✧</span>
          </div>
        </div>
        <aside className="room-panel" aria-label="Room information">
          <div className="participants-heading">
            <h2>In this room</h2>
            <span className="participant-count">
              {participants.length || 1}
            </span>
          </div>
          <p className="panel-caption">A little company for your thoughts.</p>
          <div className="participants-list">
            {participants.map((user) => (
              <div className="participant" key={user.id}>
                <span className="participant-avatar-wrap">
                  <span
                    className="avatar"
                    style={{
                      color: user.color,
                      backgroundColor: user.colorLight,
                    }}
                  >
                    {initials(user.name)}
                  </span>
                  <i />
                </span>
                <div>
                  <span className="participant-name">
                    {user.name}
                    {user.isYou && <span className="you-label">you</span>}
                  </span>
                  <span className="participant-status">
                    <span />
                    {user.editing
                      ? "Writing a little something"
                      : "Here in the room"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="name-link" onClick={onProfile}>
            Make it personal. Set your name
            <ArrowUpRight size={12} />
          </button>
          <Button
            variant="secondary"
            className="invite-button"
            onClick={onShare}
          >
            <PlusPerson />
            Invite a collaborator
          </Button>
          <div className="room-panel-divider" />
          <div className="room-details-heading">
            <h2>The little details</h2>
            <FileText size={15} />
          </div>
          <div className="room-detail">
            <span>Room ID</span>
            <button
              title="Copy room ID"
              onClick={() => {
                void navigator.clipboard
                  .writeText(room.id)
                  .then(() => notify("Room ID copied."))
                  .catch(() =>
                    notify("Find your room ID in the Share room dialog."),
                  );
              }}
            >
              <Hash size={12} />
              {room.id.slice(0, 8)}
              <Link2 size={12} />
            </button>
          </div>
          <div className="room-detail">
            <span>Access</span>
            <span className="detail-value">Anyone with the link</span>
          </div>
          <div className="room-detail">
            <span>Saving</span>
            <span className="detail-value">
              <Check size={12} />
              Automatic
            </span>
          </div>
          <div className="storage-note">
            <span className="storage-dot" />
            <span>
              {storage === "memory"
                ? "Local session · stored in memory"
                : "Safely stored with Supabase"}
            </span>
          </div>
          <Card className="together-card">
            <div className="together-illustration" aria-hidden="true">
              <span className="thought-bubble bubble-one">
                <span />
                <span />
                <span />
              </span>
              <span className="thought-bubble bubble-two">
                <HeartSmall />
              </span>
              <Sparkles className="bubble-sparkle" size={17} />
            </div>
            <span className="together-eyebrow">BETTER, TOGETHER</span>
            <h3>
              Two minds.
              <br />
              More possibilities.
            </h3>
            <p>
              A brainstorm, a shared plan,
              <br />
              or just a thought worth sharing.
            </p>
            <button onClick={onShare}>
              Let someone in
              <ArrowRightSmall />
            </button>
          </Card>
          <div className="room-panel-footnote">
            <Link2 size={13} />
            <p>
              Your room link is your invitation.
              <br />
              Share it with people you trust.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PlusPerson() {
  return <Users size={16} />;
}
function HeartSmall() {
  return <span className="bubble-heart">♡</span>;
}
function ArrowRightSmall() {
  return <span aria-hidden="true">↗</span>;
}
