import { BLOCK } from "./blocks";
import { CharacterBody } from "./physics";
import type { VoxelWorld } from "./world";

/** Find a dry, clear overlook near water rather than relying on a special terrain patch. */
export function findSpawn(world: VoxelWorld) {
  let best = { x: 0.5, y: 20, z: 0.5, yaw: 0, pitch: 0.1 };
  let bestScore = -Infinity;
  for (let x = -72; x <= 72; x += 6) {
    for (let z = -72; z <= 72; z += 6) {
      const column = world.generator.column(x, z);
      if (column.height < 5 || column.height > 16 || column.biome.surface !== BLOCK.grass) continue;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const forward = { x: Math.sin(angle), z: Math.cos(angle) };
        const near = world.generator.column(x + forward.x * 10, z + forward.z * 10);
        const middle = world.generator.column(x + forward.x * 27, z + forward.z * 27);
        const far = world.generator.column(x + forward.x * 60, z + forward.z * 60);
        if (near.height > column.height + 1 || middle.height > 2) continue;
        let waterView = 0;
        for (const depth of [18, 28, 40, 54]) {
          for (const offset of [-10, 0, 10]) {
            const sample = world.generator.column(x + forward.x * depth + forward.z * offset, z + forward.z * depth - forward.x * offset);
            if (sample.height < 0) waterView++;
          }
        }
        const score = waterView * 4 - Math.abs(column.height - 8) - Math.abs(near.height - column.height + 3) * 0.8 + (far.height > 6 ? 5 : 0) - Math.hypot(x, z) * 0.015;
        if (score <= bestScore) continue;
        const candidate = { x: x + 0.5, y: column.height + 1, z: z + 0.5, yaw: angle, pitch: 0.16 };
        const body = new CharacterBody(world, candidate);
        if (body.collides(candidate.x, candidate.y, candidate.z)) continue;
        if (world.isSolid(x + forward.x * 3, candidate.y + 1, z + forward.z * 3)) continue;
        best = candidate;
        bestScore = score;
      }
    }
  }
  if (bestScore === -Infinity) {
    for (let radius = 0; radius < 128; radius++) {
      const column = world.generator.column(radius, 0);
      if (column.height > 1) {
        best = { x: radius + 0.5, y: column.height + 12, z: 0.5, yaw: 0.7, pitch: 0.1 };
        break;
      }
    }
  }
  return best;
}
