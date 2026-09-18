import { BLOCK } from "../blocks";
import type { BlockId } from "../types";

export interface Climate {
  height: number;
  moisture: number;
  temperature: number;
  ruggedness: number;
  detail: number;
}

export interface BiomeDefinition {
  readonly id: string;
  readonly matches: (climate: Climate) => boolean;
  readonly surface: BlockId;
  readonly subsurface: BlockId;
  readonly treeDensity: number;
  readonly tree: "oak" | "pine";
}

/** First matching biome wins; add or reorder plugins without touching the generator. */
export const defaultBiomes: readonly BiomeDefinition[] = [
  { id: "shore", matches: ({ height }) => height <= 2, surface: BLOCK.sand, subsurface: BLOCK.sand, treeDensity: 0, tree: "oak" },
  { id: "alpine", matches: ({ height, ruggedness }) => height > 25 || (height > 17 && ruggedness > 0.6), surface: BLOCK.rock, subsurface: BLOCK.rock, treeDensity: 0.15, tree: "pine" },
  { id: "desert", matches: ({ temperature, moisture }) => temperature > 0.23 && moisture < 0.08, surface: BLOCK.sand, subsurface: BLOCK.sand, treeDensity: 0, tree: "oak" },
  { id: "gravel", matches: ({ detail, moisture }) => detail > 0.52 && moisture < 0.08, surface: BLOCK.gravel, subsurface: BLOCK.rock, treeDensity: 0.04, tree: "pine" },
  { id: "forest", matches: ({ moisture }) => moisture > -0.1, surface: BLOCK.grass, subsurface: BLOCK.soil, treeDensity: 0.63, tree: "oak" },
  { id: "meadow", matches: () => true, surface: BLOCK.grass, subsurface: BLOCK.soil, treeDensity: 0.17, tree: "oak" },
];
