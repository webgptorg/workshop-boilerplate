import { BLOCK } from "../blocks";
import { WORLD_CONFIG } from "../config";
import type { TerrainChunk } from "../terrain/generator";
import { hash } from "../terrain/noise";
import type { BlockDefinition, RGB } from "../types";
import type { VoxelWorld } from "../world";
import { FACES, GeometryBuffer } from "./geometry";
import { TerrainSurface } from "./terrain-surface";

export interface ShapeContext {
  buffer: GeometryBuffer;
  block: BlockDefinition;
  x: number;
  y: number;
  z: number;
  variation: number;
}
export type ShapeMesher = (context: ShapeContext) => void;

export const detailMeshers: ReadonlyMap<string, ShapeMesher> = new Map([
  ["tuft", ({ buffer, block, x, y, z, variation }: ShapeContext) => {
    for (let i = 0; i < 3; i++) {
      buffer.box({ x: x + 0.24 + i * 0.19, y, z: z + 0.35 + (i % 2) * 0.19 }, { x: 0.065, y: (0.18 + (i % 2) * 0.15) * variation, z: 0.065 }, block.top);
    }
  }],
  ["flower", ({ buffer, block, x, y, z }: ShapeContext) => {
    buffer.box({ x: x + 0.46, y, z: z + 0.46 }, { x: 0.045, y: 0.29, z: 0.045 }, [0.40, 0.52, 0.26]);
    buffer.box({ x: x + 0.39, y: y + 0.24, z: z + 0.39 }, { x: 0.18, y: 0.075, z: 0.18 }, block.top);
  }],
]);

/** Smooth earth and cubic features share one solid mesh; water uses a second draw call. */
export function meshChunk(world: VoxelWorld, cx: number, cz: number, shapes = detailMeshers) {
  const { chunkSize: size, seaLevel } = WORLD_CONFIG;
  const solid = new GeometryBuffer();
  const water = new GeometryBuffer();
  const neighborhood: TerrainChunk[] = [];
  let lowestEdit = Infinity;
  for (let dz = -1; dz <= 1; dz++) {
    for (let dx = -1; dx <= 1; dx++) {
      const chunk = world.getChunk(cx + dx, cz + dz);
      neighborhood.push(chunk);
      lowestEdit = Math.min(lowestEdit, chunk.minEditY);
    }
  }
  const center = neighborhood[4];
  const maxY = Math.max(center.maxY, center.maxEditY);
  const read = (x: number, y: number, z: number) => {
    const dx = Math.floor(x / size);
    const dz = Math.floor(z / size);
    return neighborhood[(dz + 1) * 3 + dx + 1].get(x - dx * size, y, z - dz * size);
  };
  const occludes = (x: number, y: number, z: number) => world.registry.get(read(x, y, z))?.opaque ? 1 : 0;
  const originX = cx * size;
  const originZ = cz * size;
  const surface = new TerrainSurface((x, y, z) => read(x - originX, y, z - originZ), world.registry);
  const heightAt = (x: number, z: number) => {
    const dx = Math.floor(x / size);
    const dz = Math.floor(z / size);
    return neighborhood[(dz + 1) * 3 + dx + 1].heights[x - dx * size + size * (z - dz * size)];
  };
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const wx = originX + x;
      const wz = originZ + z;
      // Extend the sea one column into the bank. The smooth ground intersects this
      // level sheet naturally, instead of inheriting the voxel coastline's squares.
      const atSea = read(x, seaLevel, z);
      const seaAbove = world.registry.get(read(x, seaLevel + 1, z));
      const hasSea = (dx: number, dz: number) => read(x + dx, seaLevel, z + dz) === BLOCK.water && read(x + dx, seaLevel + 1, z + dz) !== BLOCK.water;
      const shore = world.registry.get(atSea)?.terrain && [-1, 0, 1].some((dx) => [-1, 0, 1].some((dz) => hasSea(dx, dz)));
      const seaTop = atSea === BLOCK.water && !seaAbove?.opaque && read(x, seaLevel + 1, z) !== BLOCK.water;
      if (seaTop || shore) {
        const waterColor = world.registry.get(BLOCK.water)!.top;
        water.surfaceQuad(FACES[0].corners.map(([vx, , vz]) => {
          const height = (heightAt(x + vx - 1, z + vz - 1) + heightAt(x + vx, z + vz - 1) + heightAt(x + vx - 1, z + vz) + heightAt(x + vx, z + vz)) / 4;
          const depth = Math.max(0, seaLevel - height);
          const shallow = Math.exp(-depth * 0.65) * 0.45;
          const deep = Math.min(8, depth);
          return {
            position: [wx + vx, seaLevel + 1, wz + vz],
            normal: [0, 1, 0],
            color: [waterColor[0] + shallow * 0.35 - deep * 0.009, waterColor[1] + shallow * 0.18 - deep * 0.009, waterColor[2] - shallow * 0.06 - deep * 0.003],
          };
        }));
      }
      // Buried columns have no visible faces. Edits expand the range for caves/tunnels.
      const minY = Math.min(lowestEdit, heightAt(x, z), heightAt(x - 1, z), heightAt(x + 1, z), heightAt(x, z - 1), heightAt(x, z + 1)) - 1;
      for (let y = minY; y <= maxY; y++) {
        const id = center.get(x, y, z);
        if (id === BLOCK.air) continue;
        const block = world.registry.get(id);
        if (!block) continue;
        const variation = 0.965 + hash(wx, wz + y * 59, world.generator.seed) * 0.07;
        const shape = block.shape && shapes.get(block.shape);
        if (shape) {
          const grounded = surface.isTerrain(wx, y - 1, wz);
          const groundY = grounded ? surface.face(wx, y - 1, wz, 0).reduce((sum, vertex) => sum + vertex.position[1], 0) / 4 : y;
          shape({ buffer: solid, block, x: wx, y: groundY - (grounded ? 0.04 : 0), z: wz, variation });
          continue;
        }
        const isWater = id === BLOCK.water;
        const buffer = isWater ? water : solid;
        for (let faceIndex = 0; faceIndex < FACES.length; faceIndex++) {
          const face = FACES[faceIndex];
          const [nx, ny, nz] = face.normal;
          const neighbor = read(x + nx, y + ny, z + nz);
          const neighborBlock = world.registry.get(neighbor);
          if (block.terrain) {
            if (!neighborBlock?.terrain) solid.surfaceQuad(surface.face(wx, y, wz, faceIndex));
            continue;
          }
          if (isWater && y === seaLevel && faceIndex === 0 && seaTop) continue;
          if ((neighborBlock?.opaque && (isWater || !neighborBlock.terrain)) || (isWater && neighbor === BLOCK.water)) continue;
          const color: RGB = faceIndex === 0 ? block.top : faceIndex === 1 ? (block.bottom ?? block.side) : block.side;
          const shades = face.corners.map((corner) => {
            if (isWater) return variation;
            const tangents = [0, 1, 2].filter((axis) => face.normal[axis] === 0);
            const a = [...face.normal];
            const b = [...face.normal];
            const diagonal = [...face.normal];
            a[tangents[0]] += corner[tangents[0]] === 0 ? -1 : 1;
            b[tangents[1]] += corner[tangents[1]] === 0 ? -1 : 1;
            diagonal[tangents[0]] = a[tangents[0]];
            diagonal[tangents[1]] = b[tangents[1]];
            const sideA = occludes(x + a[0], y + a[1], z + a[2]);
            const sideB = occludes(x + b[0], y + b[1], z + b[2]);
            const cornerAO = occludes(x + diagonal[0], y + diagonal[1], z + diagonal[2]);
            return variation * (1 - (sideA && sideB ? 3 : sideA + sideB + cornerAO) * 0.065);
          });
          const emit = (tint: RGB, lower = 0, upper = 1) => {
            // Sink tree roots slightly into the rounded ground, so they stay planted.
            const root = id === BLOCK.wood && surface.isTerrain(wx, y - 1, wz) ? 0.5 : 0;
            const points = face.corners.map(([vx, vy, vz]) => [wx + vx, y + (vy ? upper : lower - root), wz + vz]);
            buffer.quad(points, face.normal, tint, shades);
          };
          if (id === BLOCK.grass && faceIndex >= 2) {
            emit(block.side, 0, 0.78);
            emit(block.top, 0.78, 1);
          } else if (isWater) {
            const depth = Math.min(8, Math.max(0, seaLevel - center.heights[x + size * z]));
            const tint: RGB = [color[0] - depth * 0.009, color[1] - depth * 0.009, color[2] - depth * 0.003];
            emit(tint);
          } else emit(color);
        }
      }
    }
  }
  return { solid, water };
}
