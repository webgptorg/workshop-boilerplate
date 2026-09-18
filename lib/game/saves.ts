import { SAVE_VERSION } from "./config";
import type { WorldSave } from "./world";

export const WORLD_SAVE_PREFIX = `v${SAVE_VERSION}:voxel-garden:world:`;
export const worldSaveKey = (id: string) => `${WORLD_SAVE_PREFIX}${id}`;

export interface SavedWorld {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  state: WorldSave;
}

type SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

export function loadWorld(storage: SaveStorage, id: string): SavedWorld | null {
  const raw = storage.getItem(worldSaveKey(id));
  if (raw === null) return null;
  const value: SavedWorld = JSON.parse(raw);
  if (!value || value.id !== id || typeof value.name !== "string" || !value.name.trim()
    || !Number.isFinite(value.createdAt) || !Number.isFinite(value.updatedAt)
    || value.state?.version !== SAVE_VERSION || !Number.isSafeInteger(value.state.seed)
    || !Array.isArray(value.state.edits)) throw new Error("This world's save cannot be read.");
  return value;
}

export function listWorlds(storage: SaveStorage): SavedWorld[] {
  const worlds: SavedWorld[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(WORLD_SAVE_PREFIX)) continue;
    const world = loadWorld(storage, key.slice(WORLD_SAVE_PREFIX.length));
    if (world) worlds.push(world);
  }
  return worlds.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createWorld(storage: SaveStorage, name: string): SavedWorld {
  name = name.trim().slice(0, 80);
  if (!name) throw new Error("Enter a name for your world.");
  const slug = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "world";
  let id = slug;
  for (let suffix = 2; storage.getItem(worldSaveKey(id)) !== null; suffix++) id = `${slug}-${suffix}`;
  const now = Date.now();
  const world: SavedWorld = {
    id, name, createdAt: now, updatedAt: now,
    state: { version: SAVE_VERSION, seed: crypto.getRandomValues(new Uint32Array(1))[0], edits: [] },
  };
  storage.setItem(worldSaveKey(id), JSON.stringify(world));
  return world;
}

export function saveWorld(storage: SaveStorage, world: SavedWorld, state: WorldSave) {
  // A world deleted in another tab must not be resurrected by autosave.
  if (storage.getItem(worldSaveKey(world.id)) === null) throw new Error("This world has been deleted.");
  storage.setItem(worldSaveKey(world.id), JSON.stringify({ ...world, updatedAt: Date.now(), state }));
}

export function deleteWorld(storage: SaveStorage, id: string) {
  storage.removeItem(worldSaveKey(id));
}
