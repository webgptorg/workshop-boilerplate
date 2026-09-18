import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { WORLD_CONFIG } from "../config";
import type { Vec3 } from "../types";
import { chunkKey, type VoxelWorld } from "../world";
import { meshChunk } from "./chunk-mesher";

interface RenderedChunk { solid?: Mesh; water?: Mesh; cx: number; cz: number }

export class ChunkRenderer {
  readonly meshes = new Map<string, RenderedChunk>();
  private pending: { cx: number; cz: number }[] = [];
  private center = "";

  constructor(
    readonly world: VoxelWorld,
    readonly scene: Scene,
    readonly material: StandardMaterial,
    readonly waterMaterial: ShaderMaterial,
    readonly shadows: ShadowGenerator,
  ) {}

  update(position: Vec3, budgetMs = 7) {
    const { chunkSize: size, renderDistance: radius, unloadDistance } = WORLD_CONFIG;
    const cx = Math.floor(position.x / size);
    const cz = Math.floor(position.z / size);
    const key = chunkKey(cx, cz);
    if (key !== this.center) {
      this.center = key;
      this.pending = [];
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dz * dz > radius * radius) continue;
          if (!this.meshes.has(chunkKey(cx + dx, cz + dz))) this.pending.push({ cx: cx + dx, cz: cz + dz });
        }
      }
      this.pending.sort((a, b) => (a.cx - cx) ** 2 + (a.cz - cz) ** 2 - (b.cx - cx) ** 2 - (b.cz - cz) ** 2);
      for (const [meshKey, chunk] of this.meshes) {
        if (Math.hypot(chunk.cx - cx, chunk.cz - cz) > radius + 1.5) this.remove(meshKey);
      }
      this.world.evict(cx, cz, unloadDistance);
      this.refreshShadows(cx, cz);
    }
    const start = performance.now();
    for (const dirty of this.world.dirty) {
      const existing = this.meshes.get(dirty);
      if (existing) this.build(existing.cx, existing.cz);
      this.world.dirty.delete(dirty);
      if (performance.now() - start > budgetMs) return;
    }
    while (this.pending.length && performance.now() - start < budgetMs) {
      const next = this.pending.shift();
      if (next) this.build(next.cx, next.cz);
    }
  }

  private build(cx: number, cz: number) {
    const key = chunkKey(cx, cz);
    const geometry = meshChunk(this.world, cx, cz);
    this.remove(key);
    const result: RenderedChunk = { cx, cz };
    for (const kind of ["solid", "water"] as const) {
      if (!geometry[kind].positions.length) continue;
      const mesh = new Mesh(`${kind}:${key}`, this.scene);
      geometry[kind].apply(mesh);
      mesh.material = kind === "solid" ? this.material : this.waterMaterial;
      mesh.isPickable = false;
      mesh.receiveShadows = kind === "solid";
      mesh.freezeWorldMatrix();
      result[kind] = mesh;
    }
    this.meshes.set(key, result);
    const [centerX, centerZ] = this.center.split(",").map(Number);
    if (result.solid && Math.hypot(cx - centerX, cz - centerZ) < 4) this.shadows.addShadowCaster(result.solid);
  }

  private refreshShadows(cx: number, cz: number) {
    for (const chunk of this.meshes.values()) {
      if (!chunk.solid) continue;
      this.shadows.removeShadowCaster(chunk.solid);
      if (Math.hypot(chunk.cx - cx, chunk.cz - cz) < 4) this.shadows.addShadowCaster(chunk.solid);
    }
  }

  private remove(key: string) {
    const chunk = this.meshes.get(key);
    if (!chunk) return;
    if (chunk.solid) this.shadows.removeShadowCaster(chunk.solid);
    chunk.solid?.dispose();
    chunk.water?.dispose();
    this.meshes.delete(key);
  }

  get ready() { return this.pending.length === 0; }

  dispose() {
    for (const key of this.meshes.keys()) this.remove(key);
    this.pending = [];
  }
}
