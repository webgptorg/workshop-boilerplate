import type { BlockDefinition, BlockId } from "./types";

/** IDs are stable because saved worlds refer to them. Zero always means air. */
export const BLOCK = {
  air: 0,
  grass: 1,
  sand: 2,
  rock: 3,
  gravel: 4,
  wood: 5,
  water: 6,
  soil: 7,
  leaves: 8,
  grassTuft: 9,
  flower: 10,
  pine: 11,
} as const;

export class BlockRegistry {
  private readonly definitions = new Map<BlockId, BlockDefinition>();

  constructor(definitions: readonly BlockDefinition[]) {
    for (const definition of definitions) this.register(definition);
  }

  register(definition: BlockDefinition) {
    if (definition.id <= 0 || definition.id > 255 || this.definitions.has(definition.id)) {
      throw new Error(`Block IDs must be unique integers between 1 and 255: ${definition.id}`);
    }
    if (!Number.isInteger(definition.id)) throw new Error("Block IDs must be integers.");
    this.definitions.set(definition.id, definition);
    return this;
  }

  get(id: BlockId) {
    return this.definitions.get(id);
  }

  get buildable() {
    return [...this.definitions.values()].filter((block) => block.buildable);
  }
}

export const blockDefinitions: readonly BlockDefinition[] = [
  { id: BLOCK.grass, name: "Grass", solid: true, terrain: true, opaque: true, buildable: true, top: [0.49, 0.65, 0.31], side: [0.43, 0.48, 0.29], bottom: [0.43, 0.34, 0.23], icon: ["#9daf79", "#789963", "#5d7b4d"] },
  { id: BLOCK.sand, name: "Sand", solid: true, terrain: true, opaque: true, buildable: true, top: [0.87, 0.80, 0.59], side: [0.78, 0.69, 0.47], icon: ["#f0dba4", "#d4b87c", "#b59a62"] },
  { id: BLOCK.rock, name: "Rock", solid: true, terrain: true, opaque: true, buildable: true, top: [0.64, 0.66, 0.62], side: [0.53, 0.57, 0.56], icon: ["#a5afb0", "#7d898b", "#626e72"] },
  { id: BLOCK.gravel, name: "Gravel", solid: true, terrain: true, opaque: true, buildable: true, top: [0.70, 0.68, 0.61], side: [0.61, 0.59, 0.52], icon: ["#c6bfb0", "#a39d8e", "#888577"] },
  { id: BLOCK.wood, name: "Wood", solid: true, opaque: true, buildable: true, top: [0.65, 0.48, 0.28], side: [0.49, 0.34, 0.21], icon: ["#c49465", "#a47750", "#855c3c"] },
  { id: BLOCK.water, name: "Water", solid: false, opaque: false, buildable: true, top: [0.27, 0.61, 0.64], side: [0.24, 0.55, 0.60], icon: ["#91ccd0", "#58a5ae", "#42878f"] },
  { id: BLOCK.soil, name: "Soil", solid: true, terrain: true, opaque: true, top: [0.48, 0.39, 0.27], side: [0.46, 0.37, 0.25], icon: ["#988266", "#7c6247", "#665039"] },
  { id: BLOCK.leaves, name: "Leaves", solid: true, opaque: true, top: [0.49, 0.64, 0.31], side: [0.40, 0.56, 0.27], icon: ["#99b573", "#799954", "#5d793f"] },
  { id: BLOCK.grassTuft, name: "Meadow grass", solid: false, opaque: false, shape: "tuft", top: [0.54, 0.65, 0.34], side: [0.48, 0.61, 0.29], icon: ["#a7b681", "#829953", "#718749"] },
  { id: BLOCK.flower, name: "Wildflower", solid: false, opaque: false, shape: "flower", top: [0.96, 0.88, 0.62], side: [0.86, 0.77, 0.47], icon: ["#f4e6b7", "#d5c579", "#ac9d57"] },
  { id: BLOCK.pine, name: "Pine needles", solid: true, opaque: true, top: [0.33, 0.50, 0.35], side: [0.27, 0.43, 0.31], icon: ["#688969", "#517853", "#406447"] },
];

export const blocks = new BlockRegistry(blockDefinitions);
