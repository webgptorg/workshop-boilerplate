import { FACES } from "../rendering/geometry";
import { TerrainSurface } from "../rendering/terrain-surface";
import type { VoxelWorld } from "../world";

type Point = readonly number[];
type Triangle = readonly [Point, Point, Point];

/** Bounded, edit-aware patches of the exact triangles used by the terrain renderer. */
export class TerrainCollision {
  private revision = -1;
  private surface: TerrainSurface;
  private readonly patches = new Map<string, Triangle[]>();

  constructor(private readonly world: VoxelWorld) {
    this.surface = this.createSurface();
  }

  private createSurface() {
    return new TerrainSurface((x, y, z) => this.world.getBlock(x, y, z), this.world.registry);
  }

  private patch(x: number, z: number, band: number) {
    if (this.revision !== this.world.revision || this.patches.size >= 512) {
      this.patches.clear();
      this.surface = this.createSurface();
      this.revision = this.world.revision;
    }
    const bx = Math.floor(x);
    const bz = Math.floor(z);
    const key = `${bx},${band},${bz}`;
    let triangles = this.patches.get(key);
    if (!triangles) {
      triangles = [];
      for (let vx = bx - 1; vx <= bx + 1; vx++) {
        for (let vz = bz - 1; vz <= bz + 1; vz++) {
          for (let vy = band * 4 - 2; vy <= band * 4 + 5; vy++) {
            if (!this.surface.isTerrain(vx, vy, vz)) continue;
            for (let face = 0; face < FACES.length; face++) {
              const [nx, ny, nz] = FACES[face].normal;
              if (this.surface.isTerrain(vx + nx, vy + ny, vz + nz)) continue;
              const points = this.surface.face(vx, vy, vz, face).map((vertex) => vertex.position);
              for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) {
                if (Math.abs(area(points[a], points[b], points[c])) > 1e-8) triangles.push([points[a], points[b], points[c]]);
              }
            }
          }
        }
      }
      this.patches.set(key, triangles);
    }
    return triangles;
  }

  heightAt(x: number, z: number, minY: number, maxY: number): number | undefined {
    let highest: number | undefined;
    // Four-block vertical bands avoid rebuilding a patch on every fractional step.
    for (let band = Math.floor(minY / 4); band <= Math.floor(maxY / 4); band++) {
      for (const triangle of this.patch(x, z, band)) {
        const [a, b, c] = triangle;
        const vertical = area(a, b, c);
        const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]);
        const nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        // Clockwise winding: positive XZ area is an upward-facing floor.
        // Very steep sides are walls, not places where a character can stand.
        if (vertical / Math.hypot(nx, vertical, nz) < 0.55) continue;
        const y = heightOnTriangle(x, z, triangle);
        if (y !== undefined && y >= minY - 1e-8 && y <= maxY + 1e-8 && (highest === undefined || y > highest)) highest = y;
      }
    }
    return highest;
  }

  contains(x: number, y: number, z: number) {
    let closest = Infinity;
    let inside = this.world.isTerrain(Math.floor(x), Math.floor(y), Math.floor(z));
    for (let band = Math.floor((y - 2) / 4); band <= Math.floor((y + 2) / 4); band++) {
      for (const triangle of this.patch(x, z, band)) {
        const surfaceY = heightOnTriangle(x, z, triangle);
        if (surfaceY === undefined || Math.abs(surfaceY - y) >= closest) continue;
        closest = Math.abs(surfaceY - y);
        inside = (surfaceY > y) === (area(...triangle) > 0);
        if (closest < 0.0001) return false;
      }
    }
    return inside;
  }
}

function heightOnTriangle(x: number, z: number, [a, b, c]: Triangle) {
  const point = [x, 0, z];
  const denominator = area(a, b, c);
  const u = area(point, b, c) / denominator;
  const v = area(a, point, c) / denominator;
  const w = 1 - u - v;
  if (Math.min(u, v, w) < -1e-8) return undefined;
  return a[1] * u + b[1] * v + c[1] * w;
}

function area(a: Point, b: Point, c: Point) {
  return (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0]);
}
