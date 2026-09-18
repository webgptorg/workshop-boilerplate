import assert from "node:assert/strict";
import test from "node:test";
import { BLOCK, blocks, BlockRegistry } from "../lib/game/blocks";
import { WORLD_CONFIG } from "../lib/game/config";
import { CharacterBody } from "../lib/game/physics";
import { raycastVoxels } from "../lib/game/raycast";
import { StateMachine } from "../lib/game/state-machine";
import { TerrainGenerator } from "../lib/game/terrain/generator";
import { trees } from "../lib/game/terrain/features";
import { defaultBiomes } from "../lib/game/terrain/biomes";
import { VoxelWorld } from "../lib/game/world";
import type { BlockAccess } from "../lib/game/types";

const flatWorld = (obstacles: (x: number, y: number, z: number) => boolean = () => false): BlockAccess => ({
  getBlock: (x, y, z) => y < 0 || obstacles(Math.floor(x), Math.floor(y), Math.floor(z)) ? BLOCK.rock : BLOCK.air,
  isSolid: (x, y, z) => y < 0 || obstacles(Math.floor(x), Math.floor(y), Math.floor(z)),
});
const simulate = (body: CharacterBody, seconds: number, x = 0, z = 0) => {
  for (let t = 0; t < seconds; t += 1 / 60) body.update(1 / 60, x, z);
};

test("generation is deterministic across traversal order, seeds and negative coordinates", () => {
  const a = new TerrainGenerator(42);
  const b = new TerrainGenerator(42);
  const expected = a.generate(-2, 1);
  b.generate(-1, 1);
  b.generate(-3, 2);
  assert.deepEqual(b.generate(-2, 1).data, expected.data);
  assert.notDeepEqual(new TerrainGenerator(43).generate(-2, 1).data, expected.data);
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      const sample = a.column(-32 + x, 16 + z);
      assert.equal(expected.heights[x + z * 16], sample.height);
      assert.notEqual(expected.get(x, sample.height, z), BLOCK.air);
    }
  }
});

test("tree features agree across chunk seams", () => {
  const generated = new Map<string, number>();
  const column = () => ({ height: 5, biome: defaultBiomes[4] });
  const record = (originX: number, originZ: number, size: number) => {
    const result = new Map<string, number>();
    trees.generate({ originX, originZ, size, seed: 122, column,
      setBlock: (x, y, z, id) => {
        if (x >= originX && x < originX + size && z >= originZ && z < originZ + size) result.set(`${x},${y},${z}`, id);
      },
    });
    return result;
  };
  for (const originX of [-16, 0]) {
    for (const originZ of [-16, 0]) {
      for (const [key, value] of record(originX, originZ, 16)) generated.set(key, value);
    }
  }
  assert.deepEqual(generated, record(-16, -16, 32));
});

test("world edits survive unloading, serialization and negative chunk boundaries", () => {
  const world = new VoxelWorld();
  world.setBlock(-1, 80, -16, BLOCK.wood);
  world.setBlock(16, -30, 0, BLOCK.air);
  assert.equal(world.getBlock(-1, 80, -16), BLOCK.wood);
  assert.ok(world.dirty.has("0,-1"));
  world.evict(40, 40, 2);
  assert.equal(world.getBlock(-1, 80, -16), BLOCK.wood);
  const saved = world.serialize({ x: -1, y: 81, z: -16, yaw: 1, pitch: 0.1 });
  const restored = new VoxelWorld();
  assert.deepEqual(restored.restore(JSON.parse(JSON.stringify(saved))), saved.player);
  assert.equal(restored.getBlock(-1, 80, -16), BLOCK.wood);
  assert.equal(restored.getBlock(16, -30, 0), BLOCK.air);
});

test("invalid saves and unregistered block IDs cannot corrupt the world", () => {
  const world = new VoxelWorld();
  assert.equal(world.setBlock(0, 12, 0, 255), false);
  assert.equal(world.setBlock(0.5, 12, 0, BLOCK.wood), false);
  assert.equal(world.restore({ version: 100, seed: WORLD_CONFIG.seed, edits: [] }), undefined);
  world.restore({ version: 1, seed: WORLD_CONFIG.seed, edits: [[0, 12, 0, 255], [1, "bad", 2, 5], null] });
  assert.equal(world.serialize().edits.length, 0);
  const registry = new BlockRegistry([]);
  const grass = blocks.get(BLOCK.grass);
  assert.ok(grass);
  registry.register(grass);
  assert.throws(() => registry.register(grass));
});

test("gravity lands on the ground and jump clears a one-block obstacle", () => {
  const body = new CharacterBody(flatWorld(), { x: 0.5, y: 10, z: 0.5 });
  simulate(body, 2);
  assert.equal(body.position.y, 0);
  assert.equal(body.grounded, true);
  assert.equal(body.jump(8.6), true);
  assert.equal(body.jump(8.6), false);
  simulate(body, 0.3);
  assert.ok(body.position.y > 1.2);
  simulate(body, 1);
  assert.equal(body.position.y, 0);
  assert.equal(body.grounded, true);
});

test("walking steps over one-block hills but respects tall walls and low ceilings", () => {
  const step = new CharacterBody(flatWorld((x, y) => x >= 2 && y === 0), { x: 0.5, y: 0, z: 0.5 });
  simulate(step, 1, 4);
  assert.ok(step.position.x > 3);
  assert.equal(step.position.y, 1);
  const wall = new CharacterBody(flatWorld((x, y) => x === 2 && y >= 0 && y <= 2), { x: 0.5, y: 0, z: 0.5 });
  simulate(wall, 1, 4);
  assert.ok(wall.position.x < 1.73);
  assert.equal(wall.position.y, 0);
  const ceiling = new CharacterBody(flatWorld((x, y) => (x >= 2 && y === 0) || y === 2), { x: 0.5, y: 0, z: 0.5 });
  simulate(ceiling, 1, 4);
  assert.ok(ceiling.position.x < 1.73);
  assert.equal(ceiling.position.y, 0);
});

test("collision remains stable across frame sizes and cannot tunnel through walls", () => {
  const world = flatWorld((x, y) => x === 2 && y >= 0 && y < 4);
  for (const delta of [1 / 144, 1 / 30, 0.2]) {
    const body = new CharacterBody(world, { x: 0.5, y: 0, z: 0.5 });
    for (let t = 0; t < 1; t += delta) body.update(delta, 8.2, 0);
    assert.ok(body.position.x < 1.73);
    assert.equal(body.position.y, 0);
  }
});

test("ray traversal returns placement normals, honors reach, and handles axis-aligned rays", () => {
  const world = flatWorld((x, y, z) => x === -2 && y === 2 && z === 0);
  const hit = raycastVoxels(world, { x: 2.5, y: 2.5, z: 0.5 }, { x: -1, y: 0, z: 0 }, 6);
  assert.ok(hit);
  assert.deepEqual(hit.position, { x: -2, y: 2, z: 0 });
  assert.deepEqual(hit.normal, { x: 1, y: 0, z: 0 });
  assert.equal(hit.distance, 3.5);
  assert.equal(raycastVoxels(world, { x: 2.5, y: 2.5, z: 0.5 }, { x: -1, y: 0, z: 0 }, 3), null);
  assert.equal(raycastVoxels(world, { x: 0, y: 2, z: 0 }, { x: 0, y: 0, z: 0 }, 6), null);
});

test("AI state transitions have predictable entry, exit, and elapsed-time behavior", () => {
  const context = { entered: 0, exited: 0, updates: 0 };
  const machine = new StateMachine<typeof context, "idle" | "walk">("idle", context, {
    idle: { enter: (ctx) => ctx.entered++, exit: (ctx) => ctx.exited++, transitions: [{ to: "walk", when: (_, time) => time >= 1 }] },
    walk: { enter: (ctx) => ctx.entered++, update: (ctx) => ctx.updates++ },
  });
  machine.update(0.5);
  assert.equal(machine.state, "idle");
  machine.update(0.5);
  assert.equal(machine.state, "walk");
  assert.equal(machine.elapsed, 0);
  machine.update(0.1);
  assert.deepEqual(context, { entered: 2, exited: 1, updates: 1 });
});

test("meshing hides shared faces but reveals edits in buried terrain and across chunk boundaries", async () => {
  const { meshChunk } = await import("../lib/game/rendering/chunk-mesher");
  class FlatGenerator extends TerrainGenerator {
    override column() { return { height: 2, biome: defaultBiomes[defaultBiomes.length - 1] }; }
  }
  const world = new VoxelWorld(new FlatGenerator(WORLD_CONFIG.seed, defaultBiomes, []));
  const vertexCount = (cx: number) => meshChunk(world, cx, 0).solid.positions.length / 3;
  const baseline = vertexCount(0);
  world.setBlock(8, 6, 8, BLOCK.wood);
  assert.equal(vertexCount(0) - baseline, 24);
  assert.deepEqual([...world.dirty], ["0,0"]);
  world.setBlock(9, 6, 8, BLOCK.wood);
  assert.equal(vertexCount(0) - baseline, 40);
  world.setBlock(8, 6, 8, BLOCK.air);
  world.setBlock(9, 6, 8, BLOCK.air);
  world.setBlock(8, -10, 8, BLOCK.air);
  assert.equal(vertexCount(0) - baseline, 24, "all six faces of a buried cavity are visible");
  const neighborBaseline = vertexCount(1);
  world.dirty.clear();
  world.setBlock(15, 6, 8, BLOCK.wood);
  world.setBlock(16, 6, 8, BLOCK.wood);
  assert.equal(vertexCount(0) - baseline - 24, 20);
  assert.equal(vertexCount(1) - neighborBaseline, 20);
  assert.deepEqual(new Set(world.dirty), new Set(["0,0", "1,0"]));
});
