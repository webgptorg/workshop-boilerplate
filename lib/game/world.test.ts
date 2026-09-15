import assert from "node:assert/strict";
import test from "node:test";
import { buildings, buildingById } from "./buildings";
import { World } from "./engine";
import { buildingModels, project, unproject } from "./models";
import { landscape, naturalAt, sampleTerrain, terrains } from "./world";

function findCell(predicate: (x: number, y: number) => boolean) {
  for (let r = 0; r < 80; r++) {
    for (let x = -r; x <= r; x++) {
      for (const y of [-r, r]) if (predicate(x, y)) return { x, y };
    }
  }
  throw new Error("No matching cell in the test region");
}

test("the world is deterministic at negative and distant coordinates", () => {
  for (const [x, y] of [
    [0, 0],
    [-43.5, 91.2],
    [1_000_001, -900_000],
    [-1_000_001, 900_000],
  ]) {
    const before = sampleTerrain(x, y);
    sampleTerrain(x + 173, y - 361);
    assert.deepEqual(sampleTerrain(x, y), before);
    assert.ok(Number.isFinite(before.height));
    assert.ok(
      before.color.every(
        (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255,
      ),
    );
  }
});

test("landscape fields are continuous across noise lattice boundaries", () => {
  for (const edge of [-130, -65, 0, 65, 130]) {
    const left = landscape(edge - 0.00001, 17);
    const right = landscape(edge + 0.00001, 17);
    assert.ok(Math.abs(left.elevation - right.elevation) < 0.0001);
    assert.ok(Math.abs(left.moisture - right.moisture) < 0.0001);
  }
});

test("world generation contains every registered biome and keeps scenery off water", () => {
  const seen = new Set<string>();
  let forestTrees = 0;
  for (let x = -300; x <= 300; x += 3) {
    for (let y = -300; y <= 300; y += 3) {
      const terrain = sampleTerrain(x + 0.5, y + 0.5);
      seen.add(terrain.type);
      if (!terrain.buildable) assert.equal(naturalAt(x, y), null);
      if (terrain.type === "forest" && naturalAt(x, y) === "tree")
        forestTrees++;
    }
  }
  assert.deepEqual([...seen].sort(), terrains.map((t) => t.id).sort());
  assert.ok(forestTrees > 0);
});

test("the starting town and fixed rival settlement are on land", () => {
  const world = new World();
  assert.equal(world.buildings.filter((b) => b.owner === "player").length, 1);
  assert.equal(world.buildings.filter((b) => b.owner === "ai").length, 4);
  for (const b of world.buildings) {
    const size = buildingById(b.type).size;
    for (let x = b.x; x <= b.x + size; x++) {
      for (let y = b.y; y <= b.y + size; y++)
        assert.ok(sampleTerrain(x, y).buildable);
    }
  }
});

test("every building can be placed freely and its entire footprint becomes occupied", () => {
  const world = new World();
  for (const definition of buildings) {
    assert.equal(typeof buildingModels[definition.model], "function");
    const { x, y } = findCell((x, y) => world.canPlace(definition.id, x, y));
    assert.ok(world.place(definition.id, x, y));
    for (let dx = 0; dx < definition.size; dx++) {
      for (let dy = 0; dy < definition.size; dy++)
        assert.equal(world.place("house", x + dx, y + dy), false);
    }
  }
});

test("water, existing towns, and natural objects reject construction", () => {
  const world = new World();
  assert.equal(world.place("house", 0, 0), false);
  const water = findCell((x, y) => !sampleTerrain(x + 0.5, y + 0.5).buildable);
  assert.equal(world.place("house", water.x, water.y), false);
  const tree = findCell((x, y) => naturalAt(x, y) === "tree");
  assert.equal(world.place("house", tree.x, tree.y), false);
});

test("saving restores valid buildings and ignores malformed or duplicate entries", () => {
  const world = new World();
  const { x, y } = findCell((x, y) => world.canPlace("market", x, y));
  world.place("market", x, y);
  const saved = JSON.parse(
    JSON.stringify(world.buildings.filter((b) => b.id.startsWith("built-"))),
  );
  const restored = new World();
  restored.restore([
    null,
    {},
    { type: "missing", x: 3, y: 3 },
    { type: "house", x: 0.5, y: 2 },
    ...saved,
    ...saved,
  ]);
  assert.equal(restored.buildings.length, world.buildings.length);
  assert.equal(restored.buildings.at(-1)?.type, "market");
  assert.ok(restored.occupied(x + 1, y + 1));
});

test("isometric picking follows camera translation and terrain height", () => {
  const world = new World();
  const camera = { x: -1103, y: 823 };
  for (const [x, y] of [
    [2, 1],
    [-7, -4],
    [18, 13],
  ]) {
    const t = sampleTerrain(x + 0.5, y + 0.5);
    const p = project(x + 0.5, y + 0.5, t.height);
    assert.deepEqual(world.pick(p[0] + camera.x, p[1] + camera.y, camera), {
      x,
      y,
    });
    const flat = project(x, y);
    assert.deepEqual(unproject(...flat), [x, y]);
  }
});
