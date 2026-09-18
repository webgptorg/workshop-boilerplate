import { BLOCK } from "../blocks";
import { WORLD_CONFIG } from "../config";
import type { BlockId } from "../types";
import { defaultBiomes, type BiomeDefinition } from "./biomes";
import { defaultFeatures, type TerrainFeature } from "./features";
import { clamp, lerp, SeededNoise, smoothstep } from "./noise";

export interface TerrainColumn {
  height: number;
  biome: BiomeDefinition;
}

export class TerrainChunk {
  readonly data: Uint8Array;
  readonly heights: Int16Array;
  readonly overrides = new Map<string, BlockId>();
  maxY = WORLD_CONFIG.seaLevel as number;
  minEditY = Infinity;
  maxEditY = -Infinity;

  constructor(readonly cx: number, readonly cz: number) {
    const { chunkSize: size, minY, maxY } = WORLD_CONFIG;
    this.data = new Uint8Array(size * size * (maxY - minY + 1));
    this.heights = new Int16Array(size * size);
  }

  get(x: number, y: number, z: number): BlockId {
    const { chunkSize: size, minY, maxY } = WORLD_CONFIG;
    if (y < minY || y > maxY) return this.overrides.get(`${x},${y},${z}`) ?? (y < minY ? BLOCK.rock : BLOCK.air);
    return this.data[x + size * (z + size * (y - minY))];
  }

  set(x: number, y: number, z: number, block: BlockId) {
    const { chunkSize: size, minY, maxY } = WORLD_CONFIG;
    if (x < 0 || z < 0 || x >= size || z >= size) return;
    if (y < minY || y > maxY) this.overrides.set(`${x},${y},${z}`, block);
    else this.data[x + size * (z + size * (y - minY))] = block;
    if (block !== BLOCK.air) this.maxY = Math.max(this.maxY, y);
  }
}

export class TerrainGenerator {
  readonly noise: SeededNoise;

  constructor(
    readonly seed: number = WORLD_CONFIG.seed,
    readonly biomes: readonly BiomeDefinition[] = defaultBiomes,
    readonly features: readonly TerrainFeature[] = defaultFeatures,
  ) {
    if (!biomes.length) throw new Error("A terrain generator needs a fallback biome.");
    this.noise = new SeededNoise(seed);
  }

  column(x: number, z: number): TerrainColumn {
    const n = this.noise;
    const warpX = x + n.fractal(x / 180 + 12, z / 180 - 31, 2) * 32;
    const warpZ = z + n.fractal(x / 180 - 42, z / 180 + 17, 2) * 32;
    const continent = n.fractal(warpX / 220, warpZ / 220, 4);
    const hills = n.fractal(x / 43 + 81, z / 43 + 62, 3);
    const ruggedness = smoothstep(0.0, 0.6, n.fractal(x / 130 + 33, z / 130 + 87, 3));
    const ridge = 1 - Math.abs(n.fractal(x / 55 - 11, z / 55 + 9, 3));
    const land = 5 + continent * 29 + hills * 4.5 + ruggedness * ridge * ridge * 30;
    const river = Math.abs(n.fractal(warpX / 125 + 47, warpZ / 125 - 91, 3));
    const riverStrength = (1 - smoothstep(0.012, 0.073, river)) * (1 - smoothstep(22, 36, land));
    const height = Math.floor(clamp(lerp(land, Math.min(land, -2), riverStrength), -18, 54));
    const climate = {
      height,
      ruggedness,
      moisture: n.fractal(x / 160 + 503, z / 160 + 702, 3),
      temperature: n.fractal(x / 200 - 302, z / 200 + 251, 3),
      detail: n.sample(x / 14 - 29, z / 14 + 17),
    };
    const biome = this.biomes.find((candidate) => candidate.matches(climate)) ?? this.biomes[this.biomes.length - 1];
    return { height, biome };
  }

  generate(cx: number, cz: number) {
    const { chunkSize: size, minY, seaLevel } = WORLD_CONFIG;
    const chunk = new TerrainChunk(cx, cz);
    const originX = cx * size;
    const originZ = cz * size;
    const columns = new Map<string, TerrainColumn>();
    const column = (x: number, z: number) => {
      const key = `${x},${z}`;
      let result = columns.get(key);
      if (!result) {
        result = this.column(x, z);
        columns.set(key, result);
      }
      return result;
    };
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const { height, biome } = column(originX + x, originZ + z);
        chunk.heights[x + size * z] = height;
        for (let y = minY; y <= Math.max(height, seaLevel); y++) {
          const id = y > height ? BLOCK.water : y === height ? biome.surface : y > height - 3 ? biome.subsurface : BLOCK.rock;
          chunk.set(x, y, z, id);
        }
      }
    }
    for (const feature of this.features) {
      feature.generate({
        originX, originZ, size, seed: this.seed, column,
        setBlock: (x, y, z, id) => chunk.set(x - originX, y, z - originZ, id),
      });
    }
    return chunk;
  }
}
