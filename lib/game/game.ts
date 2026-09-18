import "@babylonjs/core/Culling/ray";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateLineSystem } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import type { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { BLOCK, blocks } from "./blocks";
import { WORLD_CONFIG, PLAYER_CONFIG } from "./config";
import { VoxelWorld } from "./world";
import { CharacterBody } from "./physics";
import { GameInput } from "./input";
import { raycastVoxels, type VoxelHit } from "./raycast";
import { Atmosphere } from "./rendering/atmosphere";
import { ChunkRenderer } from "./rendering/chunk-renderer";
import { createTerrainMaterial, createWaterMaterial } from "./rendering/materials";
import { CreatureSystem } from "./agents";
import { findSpawn } from "./spawn";
import type { GameSystem } from "./types";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";

export interface GameOptions {
  onReady(): void;
  onSelection(index: number): void;
  onError(message: string): void;
}

/** Composition root: content and systems plug in here, outside the core world model. */
export class VoxelGame {
  readonly engine: Engine;
  readonly scene: Scene;
  readonly world = new VoxelWorld();
  readonly camera: FreeCamera;
  readonly body: CharacterBody;
  readonly input: GameInput;
  private readonly atmosphere: Atmosphere;
  private readonly renderer: ChunkRenderer;
  private readonly terrainMaterial: StandardMaterial;
  private readonly waterMaterial: ShaderMaterial;
  private readonly systems: GameSystem[] = [];
  private readonly target: LinesMesh;
  private readonly resize: ResizeObserver;
  private readonly abort = new AbortController();
  private selected = 0;
  private hit: VoxelHit | null = null;
  private saveTime = 0;
  private ready = false;
  private disposed = false;
  private lastSavedRevision = -1;

  constructor(readonly canvas: HTMLCanvasElement, readonly options: GameOptions) {
    this.engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false, powerPreference: "high-performance" }, false);
    this.engine.setHardwareScalingLevel(1 / (window.devicePixelRatio || 1));
    this.scene = new Scene(this.engine);
    this.scene.skipPointerMovePicking = true;
    this.scene.skipPointerDownPicking = true;
    this.scene.skipPointerUpPicking = true;
    let restored;
    try {
      const saved = localStorage.getItem(WORLD_CONFIG.storageKey);
      if (saved) restored = this.world.restore(JSON.parse(saved));
    } catch { /* Storage may be unavailable; the sandbox still works in memory. */ }
    const spawn = restored ?? findSpawn(this.world);
    this.body = new CharacterBody(this.world, spawn);
    // Recover safely if a saved player was inside a subsequently edited block.
    for (let i = 0; i < 80 && this.body.collides(this.body.position.x, this.body.position.y, this.body.position.z); i++) this.body.position.y++;
    this.camera = new FreeCamera("player", new Vector3(spawn.x, this.body.position.y + PLAYER_CONFIG.eyeHeight, spawn.z), this.scene);
    this.camera.inputs.clear();
    this.camera.minZ = 0.05;
    this.camera.maxZ = 600;
    this.camera.fov = 1.15;
    this.input = new GameInput(canvas, {
      edit: (remove) => this.edit(remove),
      select: (index) => this.select(index),
      cycle: (direction) => this.select((this.selected + direction + blocks.buildable.length) % blocks.buildable.length),
    });
    this.input.yaw = spawn.yaw;
    this.input.pitch = spawn.pitch;
    this.camera.rotation.set(this.input.pitch, this.input.yaw, 0);
    this.atmosphere = new Atmosphere(this.scene, this.camera);
    this.terrainMaterial = createTerrainMaterial(this.scene);
    this.waterMaterial = createWaterMaterial(this.scene);
    this.renderer = new ChunkRenderer(this.world, this.scene, this.terrainMaterial, this.waterMaterial, this.atmosphere.shadows);
    this.systems.push(new CreatureSystem(this.world, this.scene, this.terrainMaterial, this.atmosphere.shadows, this.body.position));
    const corners = [
      new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(1, 0, 1), new Vector3(0, 0, 1),
      new Vector3(0, 1, 0), new Vector3(1, 1, 0), new Vector3(1, 1, 1), new Vector3(0, 1, 1),
    ];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    this.target = CreateLineSystem("block-outline", { lines: edges.map(([a, b]) => [corners[a], corners[b]]) }, this.scene);
    this.target.color = new Color3(0.98, 0.98, 0.88);
    this.target.alpha = 0.45;
    this.target.scaling.setAll(1.006);
    this.target.isPickable = false;
    this.target.setEnabled(false);
    this.resize = new ResizeObserver(() => {
      this.engine.setHardwareScalingLevel(1 / (window.devicePixelRatio || 1));
      this.engine.resize();
    });
    this.resize.observe(canvas);
    const signal = this.abort.signal;
    window.addEventListener("pagehide", this.save, { signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.save(); }, { signal });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.save();
      this.options.onError("The graphics connection was interrupted.");
    }, { signal });
    this.renderer.update(this.body.position, 30);
    this.engine.runRenderLoop(this.frame);
  }

  select(index: number) {
    if (index < 0 || index >= blocks.buildable.length) return;
    this.selected = index;
    this.options.onSelection(index);
  }

  private edit(remove: boolean) {
    this.updateTarget();
    if (!this.hit) return;
    const { position, normal } = this.hit;
    const x = position.x + (remove ? 0 : normal.x);
    const y = position.y + (remove ? 0 : normal.y);
    const z = position.z + (remove ? 0 : normal.z);
    const block = blocks.buildable[this.selected];
    if (!remove && block.solid && this.body.intersects(x, y, z)) return;
    if (!remove && this.world.registry.get(this.world.getBlock(x, y, z))?.solid) return;
    this.world.setBlock(x, y, z, remove ? BLOCK.air : block.id);
  }

  private updateTarget() {
    const forward = this.camera.getForwardRay().direction;
    this.hit = raycastVoxels(this.world, this.camera.position, forward, WORLD_CONFIG.reach, (id) => {
      const block = blocks.get(id);
      return !!block && (!block.shape || block.shape === "cube");
    });
    this.target.setEnabled(!!this.hit);
    if (this.hit) this.target.position.set(this.hit.position.x - 0.003, this.hit.position.y - 0.003, this.hit.position.z - 0.003);
  }

  private frame = () => {
    if (this.disposed || document.hidden) return;
    const delta = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
    this.input.update(delta);
    const keys = this.input.keys;
    let x = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
    let z = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
    const length = Math.hypot(x, z);
    const speed = this.body.inWater ? 3 : keys.has("ShiftLeft") || keys.has("ShiftRight") ? PLAYER_CONFIG.sprintSpeed : PLAYER_CONFIG.speed;
    if (length) { x = x / length * speed; z = z / length * speed; }
    const sin = Math.sin(this.input.yaw);
    const cos = Math.cos(this.input.yaw);
    if (this.input.jumpRequested) { this.body.jump(PLAYER_CONFIG.jumpSpeed); this.input.jumpRequested = false; }
    this.body.update(delta, x * cos + z * sin, z * cos - x * sin, keys.has("Space"));
    const p = this.body.position;
    this.camera.position.set(p.x, p.y + PLAYER_CONFIG.eyeHeight - this.body.stepOffset, p.z);
    this.camera.rotation.set(this.input.pitch, this.input.yaw, 0);
    this.camera.getViewMatrix(true);
    this.renderer.update(p, this.ready ? 6 : 18);
    this.atmosphere.update(delta);
    for (const system of this.systems) system.update(delta);
    this.updateTarget();
    const underwater = this.world.getBlock(this.camera.position.x, this.camera.position.y, this.camera.position.z) === BLOCK.water;
    this.scene.fogStart = underwater ? 0 : this.atmosphere.fogRange.x;
    this.scene.fogEnd = underwater ? 23 : this.atmosphere.fogRange.y;
    this.scene.fogColor = underwater ? new Color3(0.21, 0.47, 0.48) : this.atmosphere.fogColor;
    this.waterMaterial.setVector3("eye", this.camera.position);
    this.waterMaterial.setColor3("fogColor", this.scene.fogColor);
    this.waterMaterial.setVector2("fogRange", this.atmosphere.fogRange);
    this.scene.render();
    if (!this.ready && this.renderer.ready) { this.ready = true; this.options.onReady(); }
    this.saveTime += delta;
    if (this.saveTime > 3) { this.save(); this.saveTime = 0; }
  };

  private save = () => {
    if (this.disposed) return;
    // Save position periodically too, even when no blocks changed.
    if (!this.ready && this.lastSavedRevision === this.world.revision) return;
    try {
      localStorage.setItem(WORLD_CONFIG.storageKey, JSON.stringify(this.world.serialize({
        ...this.body.position, yaw: this.input.yaw, pitch: this.input.pitch,
      })));
      this.lastSavedRevision = this.world.revision;
    } catch { /* Quota/private mode failures do not interrupt play. */ }
  };

  dispose() {
    if (this.disposed) return;
    this.save();
    this.disposed = true;
    this.engine.stopRenderLoop(this.frame);
    this.abort.abort(); this.resize.disconnect(); this.input.dispose();
    for (const system of this.systems) system.dispose();
    this.renderer.dispose(); this.atmosphere.dispose();
    this.target.dispose(); this.terrainMaterial.dispose(); this.waterMaterial.dispose();
    this.scene.dispose(); this.engine.dispose();
  }
}
