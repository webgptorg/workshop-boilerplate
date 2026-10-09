import "server-only";
import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  decodeBytes,
  encodeBytes,
  type RoomMessage,
  WELCOME_BODY,
  WELCOME_TITLE,
} from "@/lib/notes";

type Room = {
  id: string;
  doc: Y.Doc;
  awareness: Awareness;
  listeners: Set<(message: RoomMessage) => void>;
  channel?: RealtimeChannel;
  refresh?: ReturnType<typeof setInterval>;
  lastUsed: number;
};
type Store = {
  rooms: Map<string, Promise<Room>>;
  supabase?: SupabaseClient;
  cleanup?: ReturnType<typeof setInterval>;
};

const globalStore = globalThis as typeof globalThis & { notesStore?: Store };
const store: Store = (globalStore.notesStore ??= { rooms: new Map() });

export function storageMode() {
  if (
    process.env.NOTES_STORAGE === "memory" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.NOTES_STORAGE !== "supabase")
  )
    return "memory";
  return "supabase";
}

function database() {
  if (storageMode() === "memory") return undefined;
  if (store.supabase) return store.supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or set NOTES_STORAGE=memory for local use.",
    );
  return (store.supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}

function emit(room: Room, message: RoomMessage) {
  for (const listener of room.listeners) listener(message);
}

async function refreshDocument(room: Room) {
  const db = database();
  if (!db) return;
  const { data, error } = await db
    .from("notes_rooms")
    .select("state")
    .eq("id", room.id)
    .single();
  if (error) throw error;
  if (data?.state) Y.applyUpdate(room.doc, decodeBytes(data.state), "database");
}

async function initializeRoom(id: string, welcome: boolean): Promise<Room> {
  const doc = new Y.Doc();
  const awareness = new Awareness(doc);
  awareness.setLocalState(null);
  const room: Room = {
    id,
    doc,
    awareness,
    listeners: new Set(),
    lastUsed: Date.now(),
  };
  const db = database();
  const initial = new Y.Doc();
  initial.getText("title").insert(0, welcome ? WELCOME_TITLE : "Untitled note");
  if (welcome) initial.getText("body").insert(0, WELCOME_BODY);

  try {
    if (db) {
      // Ignore duplicate inserts: the first visitor supplies the room's initial state.
      const { error } = await db
        .from("notes_rooms")
        .upsert(
          {
            id,
            state: encodeBytes(Y.encodeStateAsUpdate(initial)),
            version: 0,
          },
          { onConflict: "id", ignoreDuplicates: true },
        );
      if (error) throw error;
      await refreshDocument(room);
      room.channel = db
        .channel(`notes:${id}`, { config: { broadcast: { self: false } } })
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notes_rooms",
            filter: `id=eq.${id}`,
          },
          (payload) => {
            if (typeof payload.new.state === "string")
              Y.applyUpdate(doc, decodeBytes(payload.new.state), "database");
          },
        )
        .on("broadcast", { event: "awareness" }, ({ payload }) => {
          if (typeof payload.data === "string")
            applyAwarenessUpdate(
              awareness,
              decodeBytes(payload.data),
              "broadcast",
            );
        })
        .on("broadcast", { event: "sync-presence" }, () => {
          const states = [...awareness.getStates().keys()];
          if (states.length)
            void room.channel?.send({
              type: "broadcast",
              event: "awareness",
              payload: {
                data: encodeBytes(encodeAwarenessUpdate(awareness, states)),
              },
            });
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            void refreshDocument(room).catch((error: unknown) =>
              console.error("Room refresh failed:", error),
            );
            void room.channel?.send({
              type: "broadcast",
              event: "sync-presence",
              payload: {},
            });
          }
        });
      // Reconcile after a dropped realtime event or an instance reconnect.
      room.refresh = setInterval(() => {
        void refreshDocument(room).catch((error: unknown) =>
          console.error("Room refresh failed:", error),
        );
      }, 10_000);
      room.refresh.unref();
    } else {
      Y.applyUpdate(doc, Y.encodeStateAsUpdate(initial));
    }
  } catch (error) {
    awareness.destroy();
    doc.destroy();
    throw error;
  } finally {
    initial.destroy();
  }

  doc.on("update", (update: Uint8Array) =>
    emit(room, { type: "document", data: encodeBytes(update) }),
  );
  awareness.on(
    "update",
    (
      {
        added,
        updated,
        removed,
      }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown,
    ) => {
      const data = encodeBytes(
        encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]),
      );
      emit(room, { type: "awareness", data });
      if (room.channel && origin !== "broadcast")
        void room.channel.send({
          type: "broadcast",
          event: "awareness",
          payload: { data },
        });
    },
  );
  return room;
}

export async function getRoom(id: string, welcome = false) {
  let pending = store.rooms.get(id);
  if (!pending) {
    pending = initializeRoom(id, welcome);
    store.rooms.set(id, pending);
    pending.catch(() => store.rooms.delete(id));
  }
  const room = await pending;
  room.lastUsed = Date.now();
  return room;
}

export function roomSnapshot(room: Room): RoomMessage[] {
  return [
    { type: "document", data: encodeBytes(Y.encodeStateAsUpdate(room.doc)) },
    {
      type: "awareness",
      data: encodeBytes(
        encodeAwarenessUpdate(room.awareness, [
          ...room.awareness.getStates().keys(),
        ]),
      ),
    },
  ];
}

export function subscribeRoom(
  room: Room,
  listener: (message: RoomMessage) => void,
) {
  room.listeners.add(listener);
  return () => {
    room.listeners.delete(listener);
    room.lastUsed = Date.now();
  };
}

export async function updateRoom(room: Room, message: RoomMessage) {
  const bytes = decodeBytes(message.data);
  if (message.type === "awareness") {
    applyAwarenessUpdate(room.awareness, bytes, "client");
    return;
  }
  // Validate the CRDT payload before changing any shared state.
  const candidate = new Y.Doc();
  try {
    Y.applyUpdate(candidate, Y.encodeStateAsUpdate(room.doc));
    Y.applyUpdate(candidate, bytes);
    if (
      candidate.getText("body").length > 500_000 ||
      candidate.getText("title").length > 200
    )
      throw new Error("This note has reached its size limit.");
  } finally {
    candidate.destroy();
  }

  const db = database();
  if (db) {
    // Compare-and-swap prevents two server instances from overwriting each other.
    let persisted = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      const { data, error } = await db
        .from("notes_rooms")
        .select("state,version")
        .eq("id", room.id)
        .single();
      if (error) throw error;
      const merged = new Y.Doc();
      try {
        Y.applyUpdate(merged, decodeBytes(data.state));
        Y.applyUpdate(merged, bytes);
        const state = encodeBytes(Y.encodeStateAsUpdate(merged));
        const result = await db
          .from("notes_rooms")
          .update({
            state,
            version: data.version + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", room.id)
          .eq("version", data.version)
          .select("id");
        if (result.error) throw result.error;
        if (result.data.length) {
          Y.applyUpdate(room.doc, Y.encodeStateAsUpdate(merged), "database");
          persisted = true;
          break;
        }
      } finally {
        merged.destroy();
      }
    }
    if (!persisted)
      throw new Error("This room is busy. Your changes will be retried.");
  } else Y.applyUpdate(room.doc, bytes, "client");
}

// Local notes survive tab switches and disappear when the server restarts.
// Idle production room caches can be rebuilt from Supabase.
if (!store.cleanup) {
  store.cleanup = setInterval(() => {
    if (storageMode() !== "supabase") return;
    for (const [id, pending] of store.rooms)
      void pending
        .then((room) => {
          if (room.listeners.size || Date.now() - room.lastUsed < 300_000)
            return;
          if (room.refresh) clearInterval(room.refresh);
          if (room.channel) void store.supabase?.removeChannel(room.channel);
          room.awareness.destroy();
          room.doc.destroy();
          store.rooms.delete(id);
        })
        .catch(() => {});
  }, 60_000);
  store.cleanup.unref();
}
