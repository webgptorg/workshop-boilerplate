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
}

export interface GameSystem {
  update(delta: number): void;
  dispose(): void;
}
