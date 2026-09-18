import assert from "node:assert/strict";
import test from "node:test";
import { BLOCK, blocks } from "../lib/game/blocks";
import { WORLD_CONFIG } from "../lib/game/config";
import { meshChunk } from "../lib/game/rendering/chunk-mesher";
import { GeometryBuffer } from "../lib/game/rendering/geometry";
import { TerrainSurface } from "../lib/game/rendering/terrain-surface";
import { defaultBiomes } from "../lib/game/terrain/biomes";
import { TerrainGenerator } from "../lib/game/terrain/generator";
import { VoxelWorld } from "../lib/game/world";

class Hills extends TerrainGenerator {
  override column(x: number, z: number) {
    return { height: 5 + Math.floor((x + z) / 3), biome: defaultBiomes[x < 0 ? 0 : 5] };
  }
}

function vertices(buffer: GeometryBuffer) {
  const result = new Map<string, number[]>();
  for (let i = 0; i < buffer.positions.length / 3; i++) {
    const key = buffer.positions.slice(i * 3, i * 3 + 3).join(",");
    const weights = buffer.textures.flatMap((group) => group.slice(i * 4, i * 4 + 4));
    assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-10);
    assert.ok(weights.every((value) => value >= 0 && value <= 1));
    const attributes = [...buffer.normals.slice(i * 3, i * 3 + 3), ...buffer.colors.slice(i * 4, i * 4 + 4), ...weights];
    if (result.has(key)) assert.deepEqual(attributes, result.get(key), "shared vertices have continuous shading");
    result.set(key, attributes);
    assert.ok(Math.abs(Math.hypot(...attributes.slice(0, 3)) - 1) < 1e-10);
    assert.ok(attributes.every(Number.isFinite));
  }
  return result;
}

test("hills blend positions, normals and materials across positive and negative chunk seams", () => {
  const world = new VoxelWorld(new Hills(WORLD_CONFIG.seed, defaultBiomes, []));
  for (const [cx, cz, dx, dz] of [[-1, 0, 1, 0], [0, -1, 0, 1], [0, 0, 1, 0]]) {
    const a = vertices(meshChunk(world, cx, cz).solid);
    const b = vertices(meshChunk(world, cx + dx, cz + dz).solid);
    const shared = [...a.keys()].filter((key) => b.has(key));
    assert.ok(shared.length >= WORLD_CONFIG.chunkSize, "the entire chunk border is welded");
    for (const key of shared) assert.deepEqual(a.get(key), b.get(key));
    assert.ok([...a.keys()].some((key) => !Number.isInteger(Number(key.split(",")[1]))), "slopes have fractional heights");
    assert.ok([...a.values()].some(([nx, ny, nz]) => ny > 0 && ny < 1 && (nx !== 0 || nz !== 0)), "slopes have blended normals");
  }
  assert.equal(world.serialize().edits.length, 0);
  assert.equal(world.revision, 0);
});

test("edits within the smoothing halo rebuild neighbors, including diagonal chunks", () => {
  const world = new VoxelWorld(new Hills(WORLD_CONFIG.seed, defaultBiomes, []));
  const before = meshChunk(world, -1, 0).solid;
  const height = world.generator.column(1, 1).height;
  world.setBlock(1, height, 1, BLOCK.air);
  assert.deepEqual(world.dirty, new Set(["0,0", "-1,0", "0,-1", "-1,-1"]));
  const after = meshChunk(world, -1, 0).solid;
  assert.notDeepEqual(after.positions, before.positions);
  const restored = new VoxelWorld(new Hills(WORLD_CONFIG.seed, defaultBiomes, []));
  restored.restore(world.serialize());
  assert.deepEqual(meshChunk(restored, -1, 0).solid.positions, after.positions);
});

test("a shoreline slopes through a continuous level water sheet", () => {
  class Coast extends TerrainGenerator {
    override column(x: number) { return { height: x < 8 ? -2 : 1, biome: defaultBiomes[0] }; }
  }
  const world = new VoxelWorld(new Coast(WORLD_CONFIG.seed, defaultBiomes, []));
  const chunk = world.getChunk(0, 0);
  const data = chunk.data.slice();
  const { solid, water } = meshChunk(world, 0, 0);
  const shorelineHeights = [];
  for (let i = 0; i < solid.positions.length; i += 3) {
    if (solid.positions[i] > 6 && solid.positions[i] < 10) shorelineHeights.push(solid.positions[i + 1]);
  }
  assert.ok(shorelineHeights.some((y) => y > -1 && y < 1));
  assert.ok(shorelineHeights.some((y) => y > 1 && y < 2));
  assert.ok(water.positions.some((x, i) => i % 3 === 0 && x === 9), "water reaches under the rounded bank");
  for (let i = 0; i < water.positions.length; i += 3) assert.equal(water.positions[i + 1], 1);
  vertices(water);
  assert.deepEqual(chunk.data, data, "rendering never changes the authoritative voxel grid");
});

test("surface extraction preserves a cave ceiling and a disconnected terrain block", () => {
  const cave = new TerrainSurface((x, y, z) => y <= 4 && !(x === 0 && z === 0 && y === 1) ? BLOCK.rock : BLOCK.air, blocks);
  const ceiling = cave.face(0, 2, 0, 1);
  assert.ok(ceiling.every((vertex) => vertex.normal[1] < 0));
  const isolated = new TerrainSurface((x, y, z) => x === 0 && y === 0 && z === 0 ? BLOCK.rock : BLOCK.air, blocks);
  for (let face = 0; face < 6; face++) {
    const vertices = isolated.face(0, 0, 0, face);
    assert.ok(vertices.every((vertex) => [...vertex.position, ...vertex.normal].every(Number.isFinite)));
    assert.equal(new Set(vertices.map((vertex) => vertex.position.join(","))).size, 4);
  }
});


test("terrain blends texture identities without inventing intervening block IDs", () => {
  const surface = new TerrainSurface((x, y) => y <= 0 ? (x < 0 ? BLOCK.grass : BLOCK.rock) : BLOCK.air, blocks);
  const weights = surface.vertex(-1, 0, 0).textureWeights!;
  assert.ok(weights[BLOCK.grass] > 0 && weights[BLOCK.rock] > 0);
  assert.equal(weights[BLOCK.sand], 0);
  assert.ok(Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-10);
});

test("cubic features and detail shapes carry material identities independently of tint", () => {
  const buffer = new GeometryBuffer();
  for (const id of [BLOCK.wood, BLOCK.leaves, BLOCK.pine, BLOCK.grassTuft, BLOCK.flower, 200]) {
    buffer.materialId = id;
    const start = buffer.positions.length / 3;
    buffer.box({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, [0.5, 0.5, 0.5]);
    for (let i = start; i < start + 24; i++) {
      const weights = buffer.textures.flatMap((group) => group.slice(i * 4, i * 4 + 4));
      assert.equal(weights[id < 12 ? id : 0], 1);
      assert.equal(weights.reduce((sum, value) => sum + value, 0), 1);
    }
  }
});
