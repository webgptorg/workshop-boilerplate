import assert from "node:assert/strict";
import test from "node:test";
import { BLOCK } from "../lib/game/blocks";
import { WORLD_CONFIG } from "../lib/game/config";
import { CharacterBody } from "../lib/game/physics";
import { defaultBiomes } from "../lib/game/terrain/biomes";
import { TerrainGenerator } from "../lib/game/terrain/generator";
import { VoxelWorld } from "../lib/game/world";

class Slope extends TerrainGenerator {
  override column(x: number) { return { height: 20 + Math.floor(x / 3), biome: defaultBiomes[5] }; }
}
class Flat extends TerrainGenerator {
  override column() { return { height: 0, biome: defaultBiomes[5] }; }
}
const makeWorld = (Generator: typeof TerrainGenerator = Flat) => new VoxelWorld(new Generator(WORLD_CONFIG.seed, defaultBiomes, []));
const advance = (body: CharacterBody, seconds: number, vx = 0, vz = 0) => {
  for (let i = 0; i < seconds * 120; i++) body.update(1 / 120, vx, vz);
};

test("walking follows fractional terrain heights uphill and downhill across chunk seams", () => {
  for (const dt of [1 / 144, 1 / 60, 1 / 30]) {
    const world = makeWorld(Slope);
    const x = -18.5;
    const y = world.getTerrainHeight(x, 0.5, 10, 20);
    assert.notEqual(y, undefined);
    const body = new CharacterBody(world, { x, y: y!, z: 0.5 });
    advance(body, 0.1);
    for (const direction of [1, -1]) {
      for (let i = 0; i < 10 / dt; i++) {
        const previousY = body.position.y;
        body.update(dt, direction * 4, 0);
        assert.ok(body.grounded, `lost ground at ${JSON.stringify(body.position)}`);
        assert.ok(Math.abs(body.position.y - previousY) < 4 * dt * 1.5 + 0.002, "no whole-block steps");
        const ground = world.getTerrainHeight(body.position.x, body.position.z, body.position.y - 1, body.position.y + 1);
        assert.ok(ground !== undefined && Math.abs(body.position.y - ground) < 1e-7, "feet follow the visible triangles");
        assert.equal(body.stepOffset, 0, "smooth terrain needs no camera step compensation");
      }
      assert.ok(direction > 0 ? body.position.x > 21 : body.position.x < -18);
    }
  }
});

test("jumping leaves a slope and lands back on its continuous surface", () => {
  const world = makeWorld(Slope);
  const body = new CharacterBody(world, { x: 0.5, y: 22, z: 0.5 });
  advance(body, 1);
  const startY = body.position.y;
  assert.equal(body.jump(8.6), true);
  advance(body, 0.2, 4);
  assert.equal(body.grounded, false);
  assert.ok(body.position.y > startY + 1);
  advance(body, 1, 4);
  assert.equal(body.grounded, true);
  const ground = world.getTerrainHeight(body.position.x, 0.5, 20, 25);
  assert.ok(ground !== undefined && Math.abs(body.position.y - ground) < 1e-7);
});

test("smooth walking respects constructed walls, stairs, and terrain cliffs", () => {
  const world = makeWorld();
  for (let y = 1; y <= 4; y++) world.setBlock(3, y, 0, BLOCK.wood);
  const body = new CharacterBody(world, { x: 0.5, y: 1, z: 0.5 });
  advance(body, 2, 4);
  assert.ok(body.position.x < 2.73);
  assert.equal(body.position.y, 1);
  const stairs = makeWorld();
  stairs.setBlock(3, 1, 0, BLOCK.wood);
  const climber = new CharacterBody(stairs, { x: 0.5, y: 1, z: 0.5 });
  advance(climber, 0.8, 4);
  assert.ok(climber.position.x > 3);
  assert.equal(climber.position.y, 2);
  class Cliff extends Flat {
    override column(x = 0) { return { height: x >= 3 ? 7 : 0, biome: defaultBiomes[5] }; }
  }
  const cliff = new CharacterBody(makeWorld(Cliff), { x: 0.5, y: 1, z: 0.5 });
  advance(cliff, 2, 4);
  assert.ok(cliff.position.x < 3);
  assert.ok(cliff.position.y < 3);
});

test("digging invalidates ground samples and stepping off a ledge starts a fall", () => {
  const world = makeWorld();
  const body = new CharacterBody(world, { x: 0.5, y: 1, z: 0.5 });
  advance(body, 0.1);
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      for (let y = -3; y <= 0; y++) world.setBlock(x, y, z, BLOCK.air);
    }
  }
  body.update(1 / 60, 0, 0);
  assert.equal(body.grounded, false);
  advance(body, 1);
  assert.ok(body.position.y < -2.9);
  assert.equal(body.grounded, true);
  const ledge = new CharacterBody(world, { x: -4, y: 1, z: 0.5 });
  advance(ledge, 0.7, 4);
  assert.equal(ledge.grounded, false);
  assert.ok(ledge.position.y < 1);
});

test("cave floors stay separate from the terrain above and ceilings block jumps", () => {
  class Cave extends Flat {
    override column() { return { height: 8, biome: defaultBiomes[5] }; }
  }
  const world = makeWorld(Cave);
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      for (let y = 1; y <= 4; y++) world.setBlock(x, y, z, BLOCK.air);
    }
  }
  const body = new CharacterBody(world, { x: 0.5, y: 1, z: 0.5 });
  advance(body, 0.1);
  assert.equal(body.position.y, 1);
  assert.equal(body.jump(12), true);
  for (let i = 0; i < 120; i++) {
    body.update(1 / 120, 0, 0);
    assert.ok(body.position.y + body.options.height <= 5.0001);
  }
  assert.equal(body.position.y, 1);
  assert.equal(body.grounded, true);
});
