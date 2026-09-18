export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type BlockId = number;
export type BlockPosition = Readonly<Vec3>;
export type RGB = readonly [number, number, number];

export interface BlockDefinition {
  readonly id: BlockId;
  readonly name: string;
  readonly solid: boolean;
  readonly opaque: boolean;
  /** Earth-like blocks share a smooth visual surface; the underlying grid stays intact. */
  readonly terrain?: boolean;
  readonly buildable?: boolean;
  readonly shape?: "cube" | "tuft" | "flower";
  readonly top: RGB;
  readonly side: RGB;
  readonly bottom?: RGB;
  readonly icon: readonly [string, string, string];
}

export interface BlockAccess {
  getBlock(x: number, y: number, z: number): BlockId;
  isSolid(x: number, y: number, z: number): boolean;
  isTerrain?(x: number, y: number, z: number): boolean;
  isInsideTerrain?(x: number, y: number, z: number): boolean;
  getTerrainHeight?(x: number, z: number, minY: number, maxY: number): number | undefined;
}

export interface GameSystem {
  update(delta: number): void;
  dispose(): void;
}
