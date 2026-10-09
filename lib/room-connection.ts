import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import {
  decodeBytes,
  encodeBytes,
  type Identity,
  type RoomMessage,
  type SyncStatus,
} from "@/lib/notes";

export type Participant = Identity & {
  id: number;
  isYou: boolean;
  editing: boolean;
};
type Callbacks = {
  status: (status: SyncStatus) => void;
  ready: (storage: "memory" | "supabase") => void;
  participants: (participants: Participant[]) => void;
  error: (message: string | null) => void;
};

/** HTTP/SSE provider: Yjs owns merging and the standard awareness protocol owns cursors. */
export class RoomConnection {
  readonly doc = new Y.Doc();
  readonly awareness = new Awareness(this.doc);
  readonly undoManager = new Y.UndoManager(this.doc.getText("body"));
  private source: EventSource;
  private pending: Uint8Array[] = [];
  private inFlight: Uint8Array[] = [];
  private timer?: ReturnType<typeof setTimeout>;
  private presenceTimer?: ReturnType<typeof setTimeout>;
  private sending = false;
  private connected = false;
  private hasJoined = false;
  private destroyed = false;
  private url: string;

  constructor(
    roomId: string,
    welcome: boolean,
    identity: Identity,
    private callbacks: Callbacks,
  ) {
    this.url = `/api/rooms/${roomId}`;
    this.source = new EventSource(`${this.url}${welcome ? "?welcome=1" : ""}`);
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;
      this.pending.push(update);
      callbacks.status(this.connected ? "saving" : "offline");
      this.scheduleFlush();
    });
    this.awareness.on("update", (_changes: unknown, origin: unknown) => {
      if (origin !== "remote") this.schedulePresence();
    });
    this.awareness.on("change", () => this.publishParticipants());
    this.awareness.setLocalStateField("user", identity);

    this.source.onmessage = (event: MessageEvent<string>) => {
      const message = JSON.parse(event.data) as RoomMessage;
      if (message.type === "document")
        Y.applyUpdate(this.doc, decodeBytes(message.data), "remote");
      else
        applyAwarenessUpdate(
          this.awareness,
          decodeBytes(message.data),
          "remote",
        );
    };
    this.source.addEventListener("ready", (event) => {
      this.connected = true;
      this.hasJoined = true;
      callbacks.ready(
        (
          JSON.parse((event as MessageEvent<string>).data) as {
            storage: "memory" | "supabase";
          }
        ).storage,
      );
      callbacks.error(null);
      callbacks.status(
        this.pending.length || this.sending ? "saving" : "saved",
      );
      this.scheduleFlush();
      this.sendPresence();
    });
    this.source.onerror = () => {
      this.connected = false;
      callbacks.status("offline");
      callbacks.error(
        "Connection interrupted. Your edits will sync when you reconnect.",
      );
    };
    window.addEventListener("pagehide", this.leave);
  }

  setIdentity(identity: Identity) {
    this.awareness.setLocalStateField("user", identity);
  }

  private publishParticipants() {
    const participants: Participant[] = [];
    this.awareness.getStates().forEach((state, id) => {
      const user: unknown = state.user;
      if (
        !user ||
        typeof user !== "object" ||
        !("name" in user) ||
        typeof user.name !== "string" ||
        !("color" in user) ||
        typeof user.color !== "string"
      )
        return;
      participants.push({
        id,
        name: user.name.slice(0, 40),
        color: /^#[a-fA-F0-9]{6}$/.test(user.color) ? user.color : "#678373",
        colorLight: `${user.color}26`,
        isYou: id === this.doc.clientID,
        editing: Boolean(state.cursor),
      });
    });
    this.callbacks.participants(
      participants.sort((a, b) => Number(b.isYou) - Number(a.isYou)),
    );
  }

  private scheduleFlush(delay = 180) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.flush();
    }, delay);
  }

  private async flush() {
    if (this.destroyed || this.sending || !this.pending.length) return;
    this.sending = true;
    const updates = this.pending.splice(0);
    this.inFlight = updates;
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "document",
          data: encodeBytes(Y.mergeUpdates(updates)),
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      if (!this.destroyed) {
        this.callbacks.error(null);
        this.callbacks.status(
          this.connected
            ? this.pending.length
              ? "saving"
              : "saved"
            : "offline",
        );
      }
    } catch {
      this.pending.unshift(...updates);
      if (!this.destroyed) {
        this.callbacks.status("offline");
        this.callbacks.error(
          "Your changes are waiting to sync. Keep this tab open; we’ll keep trying.",
        );
      }
    } finally {
      this.sending = false;
      this.inFlight = [];
      if (this.pending.length && !this.destroyed) this.scheduleFlush(1200);
    }
  }

  private schedulePresence() {
    if (this.presenceTimer || this.destroyed) return;
    this.presenceTimer = setTimeout(() => {
      this.presenceTimer = undefined;
      this.sendPresence();
    }, 70);
  }

  private sendPresence() {
    if (!this.connected || this.destroyed) return;
    const data = encodeBytes(
      encodeAwarenessUpdate(this.awareness, [this.doc.clientID]),
    );
    void fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "awareness", data }),
    }).catch(() => {});
  }

  private leave = () => {
    // React Strict Mode can dispose a connection before its initial GET arrives.
    // Sending a leave beacon then would create an empty room before its welcome state.
    if (!this.hasJoined) return;
    this.awareness.setLocalState(null);
    const data = encodeBytes(
      encodeAwarenessUpdate(this.awareness, [this.doc.clientID]),
    );
    navigator.sendBeacon(
      this.url,
      new Blob([JSON.stringify({ type: "awareness", data })], {
        type: "application/json",
      }),
    );
    const unsaved = [...this.inFlight, ...this.pending];
    if (unsaved.length)
      navigator.sendBeacon(
        this.url,
        new Blob(
          [
            JSON.stringify({
              type: "document",
              data: encodeBytes(Y.mergeUpdates(unsaved)),
            }),
          ],
          { type: "application/json" },
        ),
      );
  };

  destroy() {
    this.leave();
    this.destroyed = true;
    window.removeEventListener("pagehide", this.leave);
    this.source.close();
    if (this.timer) clearTimeout(this.timer);
    if (this.presenceTimer) clearTimeout(this.presenceTimer);
    this.undoManager.destroy();
    this.awareness.destroy();
    this.doc.destroy();
  }
}
