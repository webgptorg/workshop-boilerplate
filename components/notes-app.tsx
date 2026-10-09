"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  FileText,
  FolderOpen,
  Hash,
  Heart,
  Link2,
  Menu,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { RoomWorkspace } from "@/components/room-workspace";
import {
  createIdentity,
  initials,
  validRoomId,
  WELCOME_TITLE,
  type Identity,
  type SavedRoom,
} from "@/lib/notes";

type Workspace = { rooms: SavedRoom[]; activeId: string; identity: Identity };
type Modal = "create" | "join" | "profile" | "share" | "help" | null;

function readWorkspace(): Workspace {
  let rooms: SavedRoom[] = [];
  let identity = createIdentity();
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem("notes.rooms") ?? "[]",
    );
    if (Array.isArray(stored))
      rooms = stored.filter((room): room is SavedRoom =>
        Boolean(
          room &&
          typeof room === "object" &&
          "id" in room &&
          typeof room.id === "string" &&
          validRoomId(room.id) &&
          "title" in room &&
          typeof room.title === "string" &&
          "starred" in room &&
          typeof room.starred === "boolean" &&
          "visited" in room &&
          typeof room.visited === "number",
        ),
      );
    const user: unknown = JSON.parse(
      localStorage.getItem("notes.identity") ?? "null",
    );
    if (
      user &&
      typeof user === "object" &&
      "name" in user &&
      typeof user.name === "string" &&
      user.name.trim() &&
      "color" in user &&
      typeof user.color === "string" &&
      /^#[a-fA-F0-9]{6}$/.test(user.color)
    )
      identity = {
        name: user.name.slice(0, 40),
        color: user.color,
        colorLight: `${user.color}26`,
      };
  } catch {
    /* An unavailable browser store should never prevent writing. */
  }
  const requested = new URLSearchParams(window.location.search).get("room");
  let activeId = requested && validRoomId(requested) ? requested : rooms[0]?.id;
  if (!activeId) {
    activeId = crypto.randomUUID();
    rooms = [
      {
        id: activeId,
        title: WELCOME_TITLE,
        starred: false,
        visited: Date.now(),
        welcome: true,
      },
    ];
  } else if (!rooms.some((room) => room.id === activeId))
    rooms.unshift({
      id: activeId,
      title: "Shared note",
      starred: false,
      visited: Date.now(),
    });
  return { rooms, identity, activeId };
}

export function NotesApp() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const initial = readWorkspace();
      const requested = new URLSearchParams(window.location.search).get("room");
      if (requested && !validRoomId(requested))
        notify("That room link isn’t valid. Here’s your workspace instead.");
      setWorkspace(initial);
      window.history.replaceState(null, "", `/?room=${initial.activeId}`);
    });
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get("room");
      if (!id || !validRoomId(id)) return;
      setWorkspace(
        (current) =>
          current && {
            ...current,
            activeId: id,
            rooms: current.rooms.some((room) => room.id === id)
              ? current.rooms
              : [
                  ...current.rooms,
                  {
                    id,
                    title: "Shared note",
                    starred: false,
                    visited: Date.now(),
                  },
                ],
          },
      );
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPopState);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [notify]);

  useEffect(() => {
    if (!workspace) return;
    try {
      localStorage.setItem("notes.rooms", JSON.stringify(workspace.rooms));
      localStorage.setItem(
        "notes.identity",
        JSON.stringify(workspace.identity),
      );
    } catch {
      /* Rooms still work if storage is disabled or full. */
    }
  }, [workspace]);

  const activeRoom = workspace?.rooms.find(
    (room) => room.id === workspace.activeId,
  );
  const rooms = (workspace?.rooms ?? [])
    .filter(
      (room) =>
        (filter === "all" || room.starred) &&
        room.title.toLowerCase().includes(search.toLowerCase()),
    )
    .toSorted((a, b) => b.visited - a.visited);

  function openRoom(room: SavedRoom) {
    setWorkspace((current) => {
      if (!current) return current;
      const exists = current.rooms.some((item) => item.id === room.id);
      return {
        ...current,
        activeId: room.id,
        rooms: exists
          ? current.rooms.map((item) =>
              item.id === room.id ? { ...item, visited: Date.now() } : item,
            )
          : [...current.rooms, room],
      };
    });
    window.history.pushState(null, "", `/?room=${room.id}`);
    setSidebarOpen(false);
    setModal(null);
    setFilter("all");
    setSearch("");
  }

  const updateTitle = useCallback((id: string, title: string) => {
    setWorkspace((current) => {
      if (
        !current ||
        current.rooms.find((room) => room.id === id)?.title === title
      )
        return current;
      return {
        ...current,
        rooms: current.rooms.map((room) =>
          room.id === id ? { ...room, title } : room,
        ),
      };
    });
  }, []);

  function toggleStar() {
    setWorkspace(
      (current) =>
        current && {
          ...current,
          rooms: current.rooms.map((room) =>
            room.id === current.activeId
              ? { ...room, starred: !room.starred }
              : room,
          ),
        },
    );
  }

  return (
    <div className="notes-app">
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Dismiss navigation backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Workspace navigation"
      >
        <Link className="notes-brand" href="/" aria-label="Notes home">
          <span className="notes-mark">
            <NotebookPen size={24} strokeWidth={1.65} />
          </span>
          <span>
            notes<span className="brand-period">.</span>
          </span>
        </Link>
        <button
          className="icon-button sidebar-close"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={19} />
        </button>
        <div className="workspace-label">
          <span className="workspace-icon">
            <FolderOpen size={15} />
          </span>
          <span>My workspace</span>
          <ChevronDown size={14} />
        </div>
        <Button
          className="new-room-button"
          onClick={() => setModal("create")}
          disabled={!workspace}
        >
          <Plus size={18} /> New room<span className="shortcut">＋</span>
        </Button>
        <label className="sidebar-search">
          <Search size={17} />
          <input
            aria-label="Search rooms"
            placeholder="Find a room…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              className="icon-button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <nav className="sidebar-nav" aria-label="Room filters">
          <button
            className={filter === "all" ? "nav-item selected" : "nav-item"}
            onClick={() => setFilter("all")}
          >
            <FileText size={18} />
            All notes
            <span className="nav-count">{workspace?.rooms.length ?? 1}</span>
          </button>
          <button
            className={filter === "starred" ? "nav-item selected" : "nav-item"}
            onClick={() => setFilter("starred")}
          >
            <Star size={18} />
            Starred
            <span className="nav-count">
              {workspace?.rooms.filter((room) => room.starred).length || ""}
            </span>
          </button>
        </nav>
        <div className="room-list-heading">
          <span>YOUR ROOMS</span>
          <button
            className="icon-button"
            aria-label="Create a room"
            onClick={() => setModal("create")}
          >
            <Plus size={16} />
          </button>
        </div>
        <nav className="room-list" aria-label="Rooms">
          {rooms.map((room) => (
            <button
              key={room.id}
              className={`room-item ${room.id === workspace?.activeId ? "active" : ""}`}
              onClick={() => openRoom(room)}
              title={room.title}
            >
              <Hash size={17} />
              <span>{room.title || "Untitled note"}</span>
              {room.starred ? (
                <Star size={12} fill="currentColor" />
              ) : (
                room.id === workspace?.activeId && (
                  <span className="room-active-dot" />
                )
              )}
            </button>
          ))}
          {workspace && !rooms.length && (
            <p className="empty-rooms">
              {search
                ? "No rooms match your search."
                : "Star a note to keep it close."}
            </p>
          )}
          <button className="join-room-button" onClick={() => setModal("join")}>
            <Link2 size={15} />
            Join a room
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="little-space-card">
            <div className="little-space-art">
              <NotebookPen size={36} strokeWidth={1.2} />
              <Sparkles size={17} className="art-sparkles" />
            </div>
            <h3>A little room to think.</h3>
            <p>
              Big ideas. Small thoughts.
              <br />
              They all belong here.
            </p>
            <span className="little-card-dots">
              <i />
              <i />
              <i />
            </span>
          </div>
          <button className="help-link" onClick={() => setModal("help")}>
            <CircleHelp size={17} />A little help
            <ArrowRight size={14} />
          </button>
          <button
            className="profile-button"
            onClick={() => setModal("profile")}
            disabled={!workspace}
          >
            <span
              className="avatar"
              style={{
                backgroundColor: workspace?.identity.colorLight,
                color: workspace?.identity.color,
              }}
            >
              {workspace ? initials(workspace.identity.name) : "CH"}
            </span>
            <span className="profile-copy">
              <strong>
                {workspace?.identity.name ?? "Your little workspace"}
              </strong>
              <span>
                {workspace?.identity.name.endsWith("Hedgehog")
                  ? "Happily anonymous"
                  : "Make yourself at home"}
              </span>
            </span>
            <ChevronDown size={14} />
          </button>
          <a
            href="https://www.ptbk.io/"
            target="_blank"
            rel="noreferrer"
            className="powered-by"
          >
            Made with <Heart size={10} /> &amp; <span>Promptbook</span>
          </a>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb-workspace">My workspace</span>
            <span className="breadcrumb-divider">/</span>
            <FileText size={15} />
            <span className="breadcrumb-title">
              {activeRoom?.title || "Getting started"}
            </span>
          </div>
          <div className="topbar-actions">
            <span className="collaborative-label">
              <span className="live-dot" />A shared space
            </span>
            <button
              className="topbar-avatar avatar"
              style={{
                backgroundColor: workspace?.identity.colorLight,
                color: workspace?.identity.color,
              }}
              aria-label="Edit your name"
              onClick={() => setModal("profile")}
            >
              {workspace ? initials(workspace.identity.name) : "CH"}
            </button>
          </div>
        </header>
        {workspace && activeRoom ? (
          <RoomWorkspace
            key={activeRoom.id}
            room={activeRoom}
            identity={workspace.identity}
            onTitle={updateTitle}
            onStar={toggleStar}
            onShare={() => setModal("share")}
            onProfile={() => setModal("profile")}
            notify={notify}
          />
        ) : (
          <main className="workspace-loading" aria-label="Loading workspace">
            <NotebookPen size={32} />
            <span>Making a little space for you…</span>
          </main>
        )}
        <footer className="app-footer">
          <span>
            <span className="footer-dot" />
            Less noise. More notes.
          </span>
          <span>
            Made for thinking together <Heart size={12} />
          </span>
        </footer>
      </div>

      {modal === "create" && (
        <CreateRoom onClose={() => setModal(null)} onCreate={openRoom} />
      )}
      {modal === "join" && (
        <JoinRoom onClose={() => setModal(null)} onJoin={openRoom} />
      )}
      {modal === "profile" && workspace && (
        <ProfileDialog
          identity={workspace.identity}
          onClose={() => setModal(null)}
          onSave={(identity) => {
            setWorkspace((current) => current && { ...current, identity });
            setModal(null);
            notify("Looking good. Your name is updated.");
          }}
        />
      )}
      {modal === "share" && activeRoom && (
        <ShareDialog
          room={activeRoom}
          onClose={() => setModal(null)}
          notify={notify}
        />
      )}
      {modal === "help" && (
        <Dialog
          title="A little help, a lot of possibility."
          onClose={() => setModal(null)}
        >
          <p className="dialog-description">
            Notes keeps things simple. Here’s all you need to know.
          </p>
          <div className="help-items">
            <div>
              <NotebookPen size={20} />
              <p>
                <strong>Make a room your own</strong>Start a new room, give it a
                title, and write anything.
              </p>
            </div>
            <div>
              <Users size={20} />
              <p>
                <strong>Think together</strong>Share the room link. Anyone with
                it can read and edit. Their words and cursors appear live.
              </p>
            </div>
            <div>
              <Sparkles size={20} />
              <p>
                <strong>Come as you are</strong>Use a name, or stay anonymous as
                a friendly hedgehog.
              </p>
            </div>
            <div>
              <ArrowDownToLine size={20} />
              <p>
                <strong>Keep a copy</strong>Download your note from the editor.
                In local mode, notes last until the server restarts.
              </p>
            </div>
          </div>
          <Button className="dialog-full-button" onClick={() => setModal(null)}>
            Got it. Let’s write <ArrowRight size={16} />
          </Button>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function CreateRoom({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (room: SavedRoom) => void;
}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");
    const id = crypto.randomUUID();
    try {
      // Opening the stream creates the empty room before the editor joins it.
      const response = await fetch(`/api/rooms/${id}`);
      if (!response.ok) throw new Error("Room creation failed");
      await response.body?.cancel();
      sessionStorage.setItem(`notes.new-title.${id}`, title.trim());
      onCreate({
        id,
        title: title.trim() || "Untitled note",
        starred: false,
        visited: Date.now(),
      });
    } catch {
      setError(
        "We couldn’t create your room. Check the connection and try again.",
      );
      setCreating(false);
    }
  }
  return (
    <Dialog title="A fresh page awaits." onClose={onClose}>
      <span className="dialog-art">
        <NotebookPen size={27} />
      </span>
      <p className="dialog-description">
        Give your thoughts a little room of their own.
      </p>
      <form onSubmit={submit}>
        <label className="field-label" htmlFor="room-name">
          Room name
        </label>
        <input
          className="input"
          id="room-name"
          placeholder="e.g. Our next big idea"
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
        <p className="field-hint">You can change this anytime. No pressure.</p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="dialog-full-button"
          disabled={creating}
        >
          {creating ? "Making space…" : "Create room"}
          <ArrowRight size={17} />
        </Button>
      </form>
    </Dialog>
  );
}

function JoinRoom({
  onClose,
  onJoin,
}: {
  onClose: () => void;
  onJoin: (room: SavedRoom) => void;
}) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    let id = link.trim();
    try {
      id = new URL(id).searchParams.get("room") ?? "";
    } catch {
      /* A room ID is also welcome. */
    }
    if (!validRoomId(id)) {
      setError("Paste a full room link or a valid room ID.");
      return;
    }
    onJoin({ id, title: "Shared note", starred: false, visited: Date.now() });
  }
  return (
    <Dialog title="Good thoughts are better shared." onClose={onClose}>
      <span className="dialog-art">
        <Link2 size={27} />
      </span>
      <p className="dialog-description">
        Have an invitation? Make yourself at home.
      </p>
      <form onSubmit={submit}>
        <label className="field-label" htmlFor="room-link">
          Room link or ID
        </label>
        <input
          className="input"
          id="room-link"
          placeholder="Paste your room link here"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          autoFocus
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="dialog-full-button">
          Join room
          <ArrowRight size={17} />
        </Button>
      </form>
    </Dialog>
  );
}

function ProfileDialog({
  identity,
  onClose,
  onSave,
}: {
  identity: Identity;
  onClose: () => void;
  onSave: (identity: Identity) => void;
}) {
  const [name, setName] = useState(
    identity.name.endsWith("Hedgehog") ? "" : identity.name,
  );
  const [color, setColor] = useState(identity.color);
  const colors = [
    "#ae6b48",
    "#678373",
    "#8972b7",
    "#4b8ba8",
    "#c38c35",
    "#ba6477",
  ];
  return (
    <Dialog title="Hello, you." onClose={onClose}>
      <p className="dialog-description">
        A name makes collaboration a little more personal.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            name:
              name.trim() ||
              (identity.name.endsWith("Hedgehog")
                ? identity.name
                : createIdentity().name),
            color,
            colorLight: `${color}26`,
          });
        }}
      >
        <label className="field-label" htmlFor="your-name">
          Your name <span className="optional">(optional)</span>
        </label>
        <input
          className="input"
          id="your-name"
          placeholder={
            identity.name.endsWith("Hedgehog")
              ? identity.name
              : "Stay anonymous"
          }
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
        <p className="field-hint">
          Leave this blank to be a friendly anonymous hedgehog.
        </p>
        <span className="field-label">Your cursor color</span>
        <div className="color-options">
          {colors.map((item) => (
            <button
              key={item}
              type="button"
              aria-label={`Choose ${item} cursor color`}
              aria-pressed={color === item}
              style={{ background: item }}
              onClick={() => setColor(item)}
            >
              {color === item && <Check size={18} />}
            </button>
          ))}
        </div>
        <Button type="submit" className="dialog-full-button">
          Make yourself at home
          <ArrowRight size={17} />
        </Button>
      </form>
    </Dialog>
  );
}

function ShareDialog({
  room,
  onClose,
  notify,
}: {
  room: SavedRoom;
  onClose: () => void;
  notify: (message: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const link = `${window.location.origin}/?room=${room.id}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      notify("Room link copied. Good company is one paste away.");
    } catch {
      input.current?.select();
      notify("Select and copy the room link to share it.");
    }
  }
  return (
    <Dialog title="Make room for good company." onClose={onClose}>
      <span className="dialog-art">
        <Users size={27} />
      </span>
      <p className="dialog-description">
        Invite someone to <strong>{room.title}</strong>. A shared page can be
        the start of something good.
      </p>
      <label className="field-label" htmlFor="share-link">
        Your room link
      </label>
      <div className="share-link-field">
        <input
          ref={input}
          className="input"
          id="share-link"
          value={link}
          readOnly
          onFocus={(event) => event.target.select()}
        />
        <button
          className="icon-button"
          aria-label="Copy room link"
          onClick={() => void copy()}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <div className="share-permission">
        <span className="permission-icon">
          <Link2 size={17} />
        </span>
        <div>
          <strong>Anyone with the link can edit</strong>
          <span>No account needed. Just come as you are.</span>
        </div>
      </div>
      <Button className="dialog-full-button" onClick={() => void copy()}>
        {copied ? <Check size={17} /> : <Copy size={17} />}
        {copied ? "Link copied" : "Copy invitation link"}
      </Button>
    </Dialog>
  );
}
