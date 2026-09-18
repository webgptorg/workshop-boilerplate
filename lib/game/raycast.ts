import type { BlockAccess, BlockId, Vec3 } from "./types";

export interface VoxelHit {
  position: Vec3;
  normal: Vec3;
  block: BlockId;
  distance: number;
}

/** Amanatides–Woo traversal picks the grid itself, including chunks with pending meshes. */
export function raycastVoxels(
  world: BlockAccess,
  origin: Vec3,
  direction: Vec3,
  reach: number,
  accepts: (id: BlockId) => boolean = (id) => id !== 0,
): VoxelHit | null {
  const length = Math.hypot(direction.x, direction.y, direction.z);
  if (!Number.isFinite(length) || length === 0) return null;
  const dir = { x: direction.x / length, y: direction.y / length, z: direction.z / length };
  const cell = { x: Math.floor(origin.x), y: Math.floor(origin.y), z: Math.floor(origin.z) };
  const step = { x: Math.sign(dir.x), y: Math.sign(dir.y), z: Math.sign(dir.z) };
  const distance = { x: Math.abs(1 / dir.x), y: Math.abs(1 / dir.y), z: Math.abs(1 / dir.z) };
  const edge = (axis: keyof Vec3) => dir[axis] === 0 ? Infinity : ((step[axis] > 0 ? cell[axis] + 1 : cell[axis]) - origin[axis]) / dir[axis];
  const next = { x: edge("x"), y: edge("y"), z: edge("z") };
  let traveled = 0;
  let normal: Vec3 = { x: 0, y: 0, z: 0 };
  while (traveled <= reach) {
    const block = world.getBlock(cell.x, cell.y, cell.z);
    if (accepts(block)) return { position: { ...cell }, normal, block, distance: traveled };
    const axis = next.x <= next.y && next.x <= next.z ? "x" : next.y <= next.z ? "y" : "z";
    traveled = next[axis];
    cell[axis] += step[axis];
    next[axis] += distance[axis];
    normal = { x: 0, y: 0, z: 0 };
    normal[axis] = -step[axis];
  }
  return null;
}
