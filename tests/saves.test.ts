import assert from "node:assert/strict";
import test from "node:test";
import { SAVE_VERSION } from "../lib/game/config";
import { BLOCK } from "../lib/game/blocks";
import { createWorld, deleteWorld, listWorlds, loadWorld, saveWorld, worldSaveKey } from "../lib/game/saves";
import { TerrainGenerator } from "../lib/game/terrain/generator";
import { VoxelWorld } from "../lib/game/world";

class MemoryStorage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

test("world names produce distinct URLs and version-prefixed storage keys", () => {
  const storage = new MemoryStorage();
  const first = createWorld(storage, " My World ");
  const second = createWorld(storage, "My World");
  assert.equal(first.id, "my-world");
  assert.equal(second.id, "my-world-2");
  assert.equal(first.name, "My World");
  assert.ok(worldSaveKey(first.id).startsWith(`v${SAVE_VERSION}:`));
  assert.equal(listWorlds(storage).length, 2);
  assert.throws(() => createWorld(storage, "   "));
});

test("world terrain, structures, player position and progress survive independent saves", () => {
  const storage = new MemoryStorage();
  const first = createWorld(storage, "First");
  const second = createWorld(storage, "Second");
  const a = new VoxelWorld(new TerrainGenerator(first.state.seed));
  const b = new VoxelWorld(new TerrainGenerator(second.state.seed));
  a.setBlock(-1, 90, -16, BLOCK.wood);
  b.setBlock(-1, 90, -16, BLOCK.rock);
  const playerA = { x: -1, y: 95, z: -16, yaw: 1, pitch: 0.2, flying: true, selected: 3 };
  const playerB = { x: 40, y: 91, z: 60, yaw: 2, pitch: -0.1, flying: false, selected: 1 };
  saveWorld(storage, first, a.serialize(playerA));
  saveWorld(storage, second, b.serialize(playerB));
  for (const [record, player, block] of [[first, playerA, BLOCK.wood], [second, playerB, BLOCK.rock]] as const) {
    const saved = loadWorld(storage, record.id)!;
    const restored = new VoxelWorld(new TerrainGenerator(saved.state.seed));
    assert.deepEqual(restored.restore(saved.state), player);
    assert.equal(restored.getBlock(-1, 90, -16), block);
    assert.equal(saved.state.seed, record.state.seed);
  }
  deleteWorld(storage, first.id);
  assert.equal(loadWorld(storage, first.id), null);
  assert.deepEqual(loadWorld(storage, second.id)?.state.player, playerB);
  assert.throws(() => saveWorld(storage, first, a.serialize(playerA)));
  assert.equal(listWorlds(storage).length, 1);
});

test("old saves are ignored and incompatible or damaged records are rejected", () => {
  const storage = new MemoryStorage();
  storage.setItem("voxel-garden:world:v2", "legacy save");
  storage.setItem(`v${SAVE_VERSION - 1}:voxel-garden:world:old`, "old world");
  assert.deepEqual(listWorlds(storage), []);
  assert.equal(loadWorld(storage, "missing"), null);
  const world = createWorld(storage, "New");
  storage.setItem(worldSaveKey(world.id), JSON.stringify({ ...world, state: { ...world.state, version: SAVE_VERSION - 1 } }));
  assert.throws(() => loadWorld(storage, world.id));
  storage.setItem(worldSaveKey(world.id), "{");
  assert.throws(() => loadWorld(storage, world.id));
});

test("storage write failures are reported without creating a phantom world", () => {
  const storage = new MemoryStorage();
  storage.setItem = () => { throw new Error("Quota exceeded"); };
  assert.throws(() => createWorld(storage, "Full"));
  assert.equal(storage.length, 0);
});
