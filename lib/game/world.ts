import { BLOCK, blocks, type BlockRegistry } from "./blocks";
import { WORLD_CONFIG } from "./config";
import { TerrainGenerator, type TerrainChunk } from "./terrain/generator";
import type { BlockAccess, BlockId, Vec3 } from "./types";

export type SavedEdit = readonly [number, number, number, BlockId];
export interface WorldSave {
  version: 1;
  seed: number;
  edits: SavedEdit[];
  player?: Vec3 & { yaw: number; pitch: number };
}

export const chunkKey = (x: number, z: number) => `${x},${z}`;
export const blockKey = (x: number, y: number, z: number) => `${x},${y},${z}`;

/** Authoritative grid data; rendering, physics, AI and editing all read the same world. */
export class VoxelWorld implements BlockAccess {
  readonly chunks = new Map<string, TerrainChunk>();
  readonly dirty = new Set<string>();
  private readonly edits = new Map<string, Map<string, SavedEdit>>();
  revision = 0;

  constructor(
    readonly generator = new TerrainGenerator(),
    readonly registry: BlockRegistry = blocks,
  ) {}

  getChunk(cx: number, cz: number) {
    const key = chunkKey(cx, cz);
    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = this.generator.generate(cx, cz);
      this.chunks.set(key, chunk);
      for (const edit of this.edits.get(key)?.values() ?? []) this.applyToChunk(chunk, edit);
    }
    return chunk;
  }

  getBlock(x: number, y: number, z: number): BlockId {
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    const size = WORLD_CONFIG.chunkSize;
    const cx = Math.floor(x / size);
    const cz = Math.floor(z / size);
    return this.getChunk(cx, cz).get(x - cx * size, y, z - cz * size);
  }

  isSolid(x: number, y: number, z: number) {
    return this.registry.get(this.getBlock(x, y, z))?.solid ?? false;
  }

  setBlock(x: number, y: number, z: number, id: BlockId) {
    if (![x, y, z].every(Number.isSafeInteger) || (id !== BLOCK.air && !this.registry.get(id))) return false;
    if (this.getBlock(x, y, z) === id) return false;
    const size = WORLD_CONFIG.chunkSize;
    const cx = Math.floor(x / size);
    const cz = Math.floor(z / size);
    const key = chunkKey(cx, cz);
    let chunkEdits = this.edits.get(key);
    if (!chunkEdits) {
      chunkEdits = new Map();
      this.edits.set(key, chunkEdits);
    }
    const edit: SavedEdit = [x, y, z, id];
    chunkEdits.set(blockKey(x, y, z), edit);
    this.applyToChunk(this.getChunk(cx, cz), edit);
    // Relaxed terrain vertices sample a two-block halo, including diagonal chunks.
    this.dirty.add(key);
    const localX = x - cx * size;
    const localZ = z - cz * size;
    const offsetsX = localX < 2 ? [0, -1] : localX >= size - 2 ? [0, 1] : [0];
    const offsetsZ = localZ < 2 ? [0, -1] : localZ >= size - 2 ? [0, 1] : [0];
    for (const dx of offsetsX) {
      for (const dz of offsetsZ) this.dirty.add(chunkKey(cx + dx, cz + dz));
    }
    this.revision++;
    return true;
  }

  private applyToChunk(chunk: TerrainChunk, [x, y, z, id]: SavedEdit) {
    const size = WORLD_CONFIG.chunkSize;
    chunk.set(x - chunk.cx * size, y, z - chunk.cz * size, id);
    chunk.minEditY = Math.min(chunk.minEditY, y - 1);
    chunk.maxEditY = Math.max(chunk.maxEditY, y + 1);
  }

  evict(centerX: number, centerZ: number, radius: number) {
    for (const [key, chunk] of this.chunks) {
      if (Math.abs(chunk.cx - centerX) > radius || Math.abs(chunk.cz - centerZ) > radius) this.chunks.delete(key);
    }
  }

  serialize(player?: WorldSave["player"]): WorldSave {
    return { version: 1, seed: this.generator.seed, edits: [...this.edits.values()].flatMap((chunk) => [...chunk.values()]), player };
  }

  restore(value: unknown): WorldSave["player"] {
    if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("seed" in value) || value.seed !== this.generator.seed || !("edits" in value) || !Array.isArray(value.edits)) return;
    for (const row of value.edits) {
      if (!Array.isArray(row) || row.length !== 4 || !row.every(Number.isSafeInteger)) continue;
      const [x, y, z, id] = row as [number, number, number, number];
      if ((id !== BLOCK.air && !this.registry.get(id)) || Math.abs(y) > 4096) continue;
      const key = chunkKey(Math.floor(x / WORLD_CONFIG.chunkSize), Math.floor(z / WORLD_CONFIG.chunkSize));
      let chunkEdits = this.edits.get(key);
      if (!chunkEdits) { chunkEdits = new Map(); this.edits.set(key, chunkEdits); }
      chunkEdits.set(blockKey(x, y, z), [x, y, z, id]);
    }
    this.chunks.clear();
    if ("player" in value && value.player && typeof value.player === "object") {
      const player = value.player;
      if ("x" in player && "y" in player && "z" in player && "yaw" in player && "pitch" in player && [player.x, player.y, player.z, player.yaw, player.pitch].every((n) => typeof n === "number" && Number.isFinite(n))) {
        return player as WorldSave["player"];
      }
    }
  }
}
