import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { RGB, Vec3 } from "../types";

export const FACES = [
  { normal: [0, 1, 0], corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
  { normal: [0, -1, 0], corners: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] },
  { normal: [1, 0, 0], corners: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]] },
  { normal: [-1, 0, 0], corners: [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]] },
  { normal: [0, 0, 1], corners: [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]] },
  { normal: [0, 0, -1], corners: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] },
] as const;

export class GeometryBuffer {
  readonly positions: number[] = [];
  readonly normals: number[] = [];
  readonly indices: number[] = [];
  readonly colors: number[] = [];

  surfaceQuad(vertices: readonly SurfaceVertex[]) {
    const start = this.positions.length / 3;
    for (const vertex of vertices) {
      this.positions.push(...vertex.position);
      this.normals.push(...vertex.normal);
      this.colors.push(...vertex.color, 1);
    }
    this.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }

  quad(points: readonly (readonly number[])[], normal: readonly number[], color: RGB, shades: readonly number[] = [1, 1, 1, 1]) {
    const start = this.positions.length / 3;
    for (let i = 0; i < 4; i++) {
      this.positions.push(...points[i]);
      this.normals.push(...normal);
      this.colors.push(color[0] * shades[i], color[1] * shades[i], color[2] * shades[i], 1);
    }
    this.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }

  box(position: Vec3, size: Vec3, color: RGB) {
    for (const face of FACES) {
      this.quad(face.corners.map(([x, y, z]) => [position.x + x * size.x, position.y + y * size.y, position.z + z * size.z]), face.normal, color);
    }
  }

  apply(mesh: Mesh) {
    const data = new VertexData();
    data.positions = this.positions;
    data.normals = this.normals;
    data.indices = this.indices;
    data.colors = this.colors;
    data.applyToMesh(mesh);
  }
}

export interface SurfaceVertex {
  readonly position: readonly number[];
  readonly normal: readonly number[];
  readonly color: RGB;
}
