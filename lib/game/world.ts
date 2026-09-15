/** Deterministic world data. Rendering and simulation share no mutable terrain state. */
export type TerrainId =
  "grass" | "sand" | "rocks" | "gravel" | "forest" | "water";
export type SceneryId = "tree" | "rock" | "bush";
export type Color = readonly [number, number, number];
export interface TerrainDefinition {
  id: TerrainId;
  name: string;
  color: Color;
  buildable: boolean;
  weight: (sample: Landscape) => number;
}
export interface Landscape {
  elevation: number;
  moisture: number;
  temperature: number;
  mountain: number;
}
export interface TerrainSample {
  type: TerrainId;
  color: Color;
  height: number;
  buildable: boolean;
}
export const WORLD_SEED = 417;
export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, n));
export function hash(x: number, y: number, seed = WORLD_SEED) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 17.13) * 43758.5453123;
  return n - Math.floor(n);
}
const smooth = (t: number) => t * t * (3 - 2 * t);
export function noise(x: number, y: number, seed = WORLD_SEED): number {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = smooth(x - ix),
    fy = smooth(y - iy);
  const a = hash(ix, iy, seed),
    b = hash(ix + 1, iy, seed),
    c = hash(ix, iy + 1, seed),
    d = hash(ix + 1, iy + 1, seed);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}
export function fbm(x: number, y: number, seed = WORLD_SEED) {
  return (
    noise(x, y, seed) * 0.58 +
    noise(x * 2, y * 2, seed + 7) * 0.28 +
    noise(x * 4, y * 4, seed + 19) * 0.14
  );
}
export function landscape(x: number, y: number): Landscape {
  const continent = fbm(x / 65, y / 65);
  const riverCenter =
    13 + Math.sin(y * 0.055) * 6 + (noise(y / 23, 4) - 0.5) * 9;
  const river = Math.exp(-Math.pow((x - riverCenter) / 3.5, 2));
  const clearing = Math.exp(-(x * x + y * y) / 110);
  return {
    elevation: continent - 0.38 - river * 0.38 + clearing * 0.24,
    moisture: fbm(x / 24 + 34, y / 24 - 17, 623),
    temperature: fbm(x / 37 - 50, y / 37 + 40, 892),
    mountain:
      clamp((fbm(x / 19 + 17, y / 19 + 51, 119) - 0.57) * 4) * (1 - clearing),
  };
}
/** Terrain plugins contribute blend weights; the same transition system handles all ground types. */
export const terrains: readonly TerrainDefinition[] = [
  {
    id: "water",
    name: "Ocean",
    color: [67, 133, 139],
    buildable: false,
    weight: (s) => (s.elevation < 0 ? 1 : 0),
  },
  {
    id: "sand",
    name: "Sand",
    color: [211, 199, 151],
    buildable: true,
    weight: (s) =>
      Math.max(
        clamp(1 - s.elevation / 0.065),
        clamp((s.temperature - 0.57) * 8),
      ),
  },
  {
    id: "rocks",
    name: "Rocks",
    color: [146, 155, 139],
    buildable: true,
    weight: (s) => clamp((s.mountain - 0.25) * 2.8),
  },
  {
    id: "gravel",
    name: "Gravel",
    color: [167, 172, 143],
    buildable: true,
    weight: (s) => clamp(1 - Math.abs(s.mountain - 0.28) * 6) * 0.6,
  },
  {
    id: "forest",
    name: "Forest bed",
    color: [111, 137, 91],
    buildable: true,
    weight: (s) => clamp((s.moisture - 0.47) * 8),
  },
  {
    id: "grass",
    name: "Grass",
    color: [151, 170, 109],
    buildable: true,
    weight: () => 1,
  },
];
export function sampleTerrain(x: number, y: number): TerrainSample {
  const s = landscape(x, y);
  if (s.elevation < 0)
    return {
      type: "water",
      color: terrains[0].color,
      height: 0,
      buildable: false,
    };
  let remaining = 1,
    dominant = 0,
    type: TerrainId = "grass";
  const color = [0, 0, 0];
  for (const definition of terrains.filter((t) => t.id !== "water")) {
    const weight = clamp(definition.weight(s)) * remaining;
    remaining -= weight;
    if (weight > dominant) {
      dominant = weight;
      type = definition.id;
    }
    for (let i = 0; i < 3; i++) color[i] += definition.color[i] * weight;
  }
  return {
    type,
    color: [color[0], color[1], color[2]],
    height:
      Math.min(s.elevation * 24, 7) +
      s.mountain * s.mountain * 110 * clamp(s.elevation / 0.12),
    buildable: true,
  };
}
export interface SceneryDefinition {
  id: SceneryId;
  probability: (terrain: TerrainSample, x: number, y: number) => number;
}
export const scenery: readonly SceneryDefinition[] = [
  {
    id: "tree",
    probability: (t) =>
      t.type === "forest" ? 0.66 : t.type === "grass" ? 0.14 : 0,
  },
  {
    id: "rock",
    probability: (t) =>
      t.type === "rocks" ? 0.35 : t.type === "gravel" ? 0.11 : 0.015,
  },
  {
    id: "bush",
    probability: (t) => (t.type === "grass" || t.type === "forest" ? 0.065 : 0),
  },
];
export function naturalAt(x: number, y: number): SceneryId | null {
  if (Math.hypot(x, y) < 4.5) return null;
  const t = sampleTerrain(x + 0.5, y + 0.5);
  if (!t.buildable || t.type === "sand") return null;
  let roll = hash(x, y, 782);
  for (const item of scenery) {
    const p = item.probability(t, x, y);
    if (roll < p) return item.id;
    roll -= p;
  }
  return null;
}
