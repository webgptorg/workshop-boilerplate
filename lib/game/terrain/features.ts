import { BLOCK } from "../blocks";
import type { BlockId } from "../types";
import type { TerrainColumn } from "./generator";
import { hash } from "./noise";

export interface FeatureContext {
  readonly originX: number;
  readonly originZ: number;
  readonly size: number;
  readonly seed: number;
  column(x: number, z: number): TerrainColumn;
  setBlock(x: number, y: number, z: number, id: BlockId): void;
}

export interface TerrainFeature {
  readonly id: string;
  generate(context: FeatureContext): void;
}

/** Tree roots are sampled in world-space cells, including neighbors, to prevent seams. */
export const trees: TerrainFeature = {
  id: "trees",
  generate(context) {
    const { originX, originZ, size, seed, column, setBlock } = context;
    const spacing = 8;
    const margin = 4;
    for (let gx = Math.floor((originX - margin) / spacing); gx <= Math.floor((originX + size + margin) / spacing); gx++) {
      for (let gz = Math.floor((originZ - margin) / spacing); gz <= Math.floor((originZ + size + margin) / spacing); gz++) {
        const x = gx * spacing + 2 + Math.floor(hash(gx, gz, seed + 71) * 4);
        const z = gz * spacing + 2 + Math.floor(hash(gx, gz, seed + 72) * 4);
        const ground = column(x, z);
        if (ground.height < 3 || hash(gx, gz, seed + 73) > ground.biome.treeDensity) continue;
        const height = 4 + Math.floor(hash(gx, gz, seed + 74) * 3);
        const bottom = ground.height + 1;
        const pine = ground.biome.tree === "pine";
        if (pine) {
          for (let dy = 2; dy <= height + 3; dy++) {
            const radius = Math.max(0, Math.floor((height + 3 - dy) / 2));
            for (let dx = -radius; dx <= radius; dx++) {
              for (let dz = -radius; dz <= radius; dz++) {
                if (Math.abs(dx) === radius && Math.abs(dz) === radius && radius > 1) continue;
                setBlock(x + dx, bottom + dy, z + dz, BLOCK.pine);
              }
            }
          }
        } else {
          const wide = hash(gx, gz, seed + 75) > 0.55;
          for (let dy = height - 2; dy <= height + 2; dy++) {
            const radius = dy === height + 2 ? 1 : dy === height - 2 ? 2 : wide ? 3 : 2;
            for (let dx = -radius; dx <= radius; dx++) {
              for (let dz = -radius; dz <= radius; dz++) {
                if (Math.abs(dx) === radius && Math.abs(dz) === radius) continue;
                setBlock(x + dx, bottom + dy, z + dz, BLOCK.leaves);
              }
            }
          }
        }
        for (let dy = 0; dy < height; dy++) setBlock(x, bottom + dy, z, BLOCK.wood);
      }
    }
  },
};

export const meadowDetails: TerrainFeature = {
  id: "meadow-details",
  generate({ originX, originZ, size, seed, column, setBlock }) {
    for (let x = originX; x < originX + size; x++) {
      for (let z = originZ; z < originZ + size; z++) {
        const ground = column(x, z);
        if (ground.biome.surface !== BLOCK.grass) continue;
        const chance = hash(x, z, seed + 101);
        if (chance < 0.065) setBlock(x, ground.height + 1, z, BLOCK.grassTuft);
        else if (chance < 0.075) setBlock(x, ground.height + 1, z, BLOCK.flower);
      }
    }
  },
};

export const defaultFeatures: readonly TerrainFeature[] = [meadowDetails, trees];
