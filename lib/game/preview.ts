import { BLOCK, blocks } from "./blocks";
import { findSpawn } from "./spawn";
import { TerrainGenerator } from "./terrain/generator";
import type { RGB } from "./types";
import { VoxelWorld, type WorldSave } from "./world";

/** A small orthographic view of real terrain and edits, without a WebGL engine. */
export function drawWorldPreview(canvas: HTMLCanvasElement, save: WorldSave) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const world = new VoxelWorld(new TerrainGenerator(save.seed));
  const player = world.restore(save) ?? findSpawn(world);
  const size = 34;
  const originX = Math.floor(player.x) - size / 2;
  const originZ = Math.floor(player.z) - size / 2;
  let floor = Infinity;
  let ceiling = -Infinity;
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const height = world.generator.column(originX + x, originZ + z).height;
      floor = Math.min(floor, height - 3);
      ceiling = Math.max(ceiling, height + 14, 0);
    }
  }
  // Include builds above/below the generated terrain without scanning empty sky.
  const extraHeights = new Set<number>();
  for (const [x, y, z] of world.serialize().edits) {
    if (x >= originX && x < originX + size && z >= originZ && z < originZ + size && (y < floor || y > ceiling)) extraHeights.add(y);
  }
  const heights = Array.from({ length: ceiling - floor + 1 }, (_, i) => floor + i).concat([...extraHeights]).sort((a, b) => a - b);
  const cubes: { x: number; y: number; z: number; id: number; top: boolean; left: boolean; right: boolean }[] = [];
  let minV = Infinity;
  let maxV = -Infinity;
  const visible = (x: number, y: number, z: number) => {
    const id = world.getBlock(originX + x, y, originZ + z);
    const block = blocks.get(id);
    return block && (!block.shape || block.shape === "cube") ? id : BLOCK.air;
  };
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      for (const y of heights) {
        const id = visible(x, y, z);
        if (id === BLOCK.air) continue;
        const top = visible(x, y + 1, z) === BLOCK.air;
        const left = z === size - 1 || visible(x, y, z + 1) === BLOCK.air;
        const right = x === size - 1 || visible(x + 1, y, z) === BLOCK.air;
        if (!top && !left && !right) continue;
        cubes.push({ x, y, z, id, top, left, right });
        minV = Math.min(minV, (x + z) * 0.5 - y - 1);
        maxV = Math.max(maxV, (x + z + 2) * 0.5 - y);
      }
    }
  }
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  const scale = Math.min((width - 40) / (size * 2), (height - 34) / (maxV - minV));
  const offsetY = (height - (maxV - minV) * scale) / 2 - minV * scale;
  const project = (x: number, y: number, z: number): [number, number] => [width / 2 + (x - z) * scale, offsetY + ((x + z) * 0.5 - y) * scale];
  const face = (points: [number, number][], rgb: RGB, shade: number) => {
    context.fillStyle = `rgb(${rgb.map((channel) => Math.round(channel * 255 * shade)).join(" ")})`;
    context.beginPath();
    points.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y));
    context.closePath();
    context.fill();
  };
  cubes.sort((a, b) => a.x + a.z - b.x - b.z || a.y - b.y);
  for (const { x, y, z, id, top, left, right } of cubes) {
    const block = blocks.get(id)!;
    const variation = 0.96 + ((x * 13 + z * 7 + y * 3) % 7) * 0.01;
    if (left) face([project(x, y + 1, z + 1), project(x + 1, y + 1, z + 1), project(x + 1, y, z + 1), project(x, y, z + 1)], block.side, variation * 0.88);
    if (right) face([project(x + 1, y + 1, z), project(x + 1, y + 1, z + 1), project(x + 1, y, z + 1), project(x + 1, y, z)], block.side, variation * 0.72);
    if (top) face([project(x, y + 1, z), project(x + 1, y + 1, z), project(x + 1, y + 1, z + 1), project(x, y + 1, z + 1)], block.top, variation * 1.12);
  }
}
