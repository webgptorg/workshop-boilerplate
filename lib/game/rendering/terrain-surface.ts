import type { BlockRegistry } from "../blocks";
import type { BlockId } from "../types";
import { TEXTURE_SLOTS, textureWeights } from "./texture-weights";
import { FACES, type SurfaceVertex } from "./geometry";

const CORNERS = Array.from({ length: 8 }, (_, i) => [i & 1, (i >> 1) & 1, (i >> 2) & 1]);
const EDGES = CORNERS.flatMap((_, i) => [0, 1, 2].filter((axis) => !(i & (1 << axis))).map((axis) => [i, i | (1 << axis), axis]));

interface SurfaceCell extends SurfaceVertex {
  readonly textureWeights: readonly number[];
  readonly neighbors: readonly (readonly number[])[];
}

/** Surface nets on voxel centers, followed by one local relaxation pass.
 * World-space sampling and a two-block halo give adjacent chunks identical vertices.
 * Unlike a height map, this also preserves excavations, caves and overhangs.
 */
export class TerrainSurface {
  private readonly cells = new Map<string, SurfaceCell | null>();
  private readonly vertices = new Map<string, SurfaceVertex>();

  constructor(
    private readonly read: (x: number, y: number, z: number) => BlockId,
    private readonly registry: BlockRegistry,
  ) {}

  isTerrain(x: number, y: number, z: number) {
    return this.registry.get(this.read(x, y, z))?.terrain === true;
  }

  private cell(x: number, y: number, z: number): SurfaceCell | null {
    const key = `${x},${y},${z}`;
    if (this.cells.has(key)) return this.cells.get(key) ?? null;
    const blocks = CORNERS.map(([dx, dy, dz]) => this.registry.get(this.read(x + dx, y + dy, z + dz)));
    const inside = blocks.map((block) => block?.terrain === true);
    if (inside.every(Boolean) || !inside.some(Boolean)) {
      this.cells.set(key, null);
      return null;
    }
    const position = [0, 0, 0];
    const normal = [0, 0, 0];
    const color = [0, 0, 0];
    const textures = Array<number>(TEXTURE_SLOTS).fill(0);
    let crossings = 0;
    for (const [a, b, axis] of EDGES) {
      if (inside[a] === inside[b]) continue;
      crossings++;
      for (let i = 0; i < 3; i++) position[i] += (CORNERS[a][i] + CORNERS[b][i]) / 2;
      normal[axis] += inside[a] ? 1 : -1;
      const block = blocks[inside[a] ? a : b]!;
      textureWeights(block.id).forEach((value, i) => { textures[i] += value; });
      for (let i = 0; i < 3; i++) color[i] += block.top[i];
    }
    const neighbors: number[][] = [];
    for (const face of FACES) {
      const axis = face.normal.findIndex((n) => n !== 0);
      const side = face.normal[axis] > 0 ? 1 : 0;
      const faceCorners = CORNERS.map((corner, i) => corner[axis] === side ? inside[i] : undefined).filter((value) => value !== undefined);
      if (faceCorners.some(Boolean) && !faceCorners.every(Boolean)) neighbors.push([...face.normal]);
    }
    const cell: SurfaceCell = {
      position: position.map((value, axis) => [x, y, z][axis] + 0.5 + value / crossings),
      normal,
      color: [color[0] / crossings, color[1] / crossings, color[2] / crossings],
      textureWeights: textures.map((value) => value / crossings),
      neighbors,
    };
    this.cells.set(key, cell);
    return cell;
  }

  vertex(x: number, y: number, z: number): SurfaceVertex {
    const key = `${x},${y},${z}`;
    const cached = this.vertices.get(key);
    if (cached) return cached;
    const cell = this.cell(x, y, z);
    if (!cell) throw new Error("A terrain surface vertex must border both solid and empty voxels.");
    const position = cell.position.map((value) => value * 2);
    const normal = cell.normal.map((value) => value * 2);
    const color = cell.color.map((value) => value * 2);
    const textures = cell.textureWeights.map((value) => value * 2);
    let weight = 2;
    for (const [dx, dy, dz] of cell.neighbors) {
      const neighbor = this.cell(x + dx, y + dy, z + dz);
      if (!neighbor) continue;
      weight++;
      neighbor.textureWeights.forEach((value, i) => { textures[i] += value; });
      for (let axis = 0; axis < 3; axis++) {
        position[axis] += neighbor.position[axis];
        normal[axis] += neighbor.normal[axis];
        color[axis] += neighbor.color[axis];
      }
    }
    const length = Math.hypot(...normal);
    const vertex: SurfaceVertex = {
      position: position.map((value) => value / weight),
      normal: length > 0 ? normal.map((value) => value / length) : [0, 1, 0],
      color: [color[0] / weight, color[1] / weight, color[2] / weight],
      textureWeights: textures.map((value) => value / weight),
    };
    this.vertices.set(key, vertex);
    return vertex;
  }

  face(x: number, y: number, z: number, faceIndex: number) {
    return FACES[faceIndex].corners.map(([dx, dy, dz]) => this.vertex(x + dx - 1, y + dy - 1, z + dz - 1));
  }
}
