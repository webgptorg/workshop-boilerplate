import { BLOCK } from "./blocks";
import { PLAYER_CONFIG } from "./config";
import type { BlockAccess, Vec3 } from "./types";

export interface BodyOptions {
  radius: number;
  height: number;
  gravity: number;
  stepHeight: number;
}

export class CharacterBody {
  readonly position: Vec3;
  velocityY = 0;
  grounded = false;
  stepOffset = 0;

  constructor(
    readonly world: BlockAccess,
    position: Vec3,
    readonly options: BodyOptions = PLAYER_CONFIG,
  ) {
    this.position = { ...position };
    const ground = world.getTerrainHeight?.(position.x, position.z, position.y - 0.75, position.y + 0.75);
    if (ground !== undefined && ground > position.y && !this.collides(position.x, ground, position.z)) this.position.y = ground;
  }

  intersects(x: number, y: number, z: number) {
    const r = this.options.radius;
    const p = this.position;
    return p.x + r > x && p.x - r < x + 1 && p.z + r > z && p.z - r < z + 1 && p.y + this.options.height > y && p.y < y + 1;
  }

  collides(x: number, y: number, z: number) {
    const { radius, height } = this.options;
    const epsilon = 0.0001;
    if (this.world.isInsideTerrain) {
      // Sample a rounded footprint against the actual terrain volume. The raised
      // outer samples let feet follow a slope while retaining wall/head clearance.
      for (const [dx, dz] of [[0, 0], [-radius, 0], [radius, 0], [0, -radius], [0, radius]]) {
        const bottom = dx === 0 && dz === 0 ? epsilon : Math.min(height / 2, radius * 1.5);
        const count = Math.ceil((height - bottom) / 0.4);
        for (let i = 0; i <= count; i++) {
          const sampleY = y + bottom + (height - epsilon - bottom) * i / count;
          if (this.world.isInsideTerrain(x + dx, sampleY, z + dz)) return true;
        }
      }
    }
    for (let bx = Math.floor(x - radius + epsilon); bx <= Math.floor(x + radius - epsilon); bx++) {
      for (let bz = Math.floor(z - radius + epsilon); bz <= Math.floor(z + radius - epsilon); bz++) {
        for (let by = Math.floor(y + epsilon); by <= Math.floor(y + height - epsilon); by++) {
          if (this.world.isInsideTerrain && this.world.isTerrain?.(bx, by, bz)) continue;
          if (this.world.isSolid(bx, by, bz)) return true;
        }
      }
    }
    return false;
  }

  get inWater() {
    return this.world.getBlock(this.position.x, this.position.y + this.options.height * 0.5, this.position.z) === BLOCK.water;
  }

  jump(speed: number) {
    if (this.grounded) { this.velocityY = speed; this.grounded = false; return true; }
    return false;
  }

  update(delta: number, velocityX: number, velocityZ: number, swim = false) {
    const steps = Math.max(1, Math.ceil(delta / (1 / 120)));
    const dt = delta / steps;
    const wet = this.inWater;
    for (let step = 0; step < steps; step++) {
      const p = this.position;
      this.moveHorizontal("x", velocityX * dt);
      this.moveHorizontal("z", velocityZ * dt);
      if (wet && swim) this.velocityY = Math.min(3.8, this.velocityY + 35 * dt);
      else this.velocityY = Math.max(wet ? -4 : -45, this.velocityY - this.options.gravity * (wet ? 0.25 : 1) * dt);
      const nextY = p.y + this.velocityY * dt;
      const floor = this.velocityY <= 0 ? this.world.getTerrainHeight?.(p.x, p.z, nextY - 0.001, p.y + 0.001) : undefined;
      if (floor !== undefined && nextY <= floor && !this.collides(p.x, floor, p.z)) {
        p.y = floor;
        this.grounded = true;
        this.velocityY = 0;
      } else if (this.collides(p.x, nextY, p.z)) {
        if (this.world.isInsideTerrain) {
          // A rounded ceiling/contact can lie between voxel planes, too.
          let safe = p.y;
          let blocked = nextY;
          for (let i = 0; i < 12; i++) {
            const middle = (safe + blocked) / 2;
            if (this.collides(p.x, middle, p.z)) blocked = middle;
            else safe = middle;
          }
          const head = this.velocityY > 0 ? this.options.height : 0;
          const plane = Math.round(safe + head) - head;
          p.y = Math.abs(plane - safe) < 0.001 && !this.collides(p.x, plane, p.z) ? plane : safe;
          this.grounded = this.velocityY < 0;
        } else if (this.velocityY < 0) {
          p.y = Math.floor(p.y + 0.0001);
          this.grounded = true;
        } else {
          p.y = Math.ceil(p.y + this.options.height - 0.0001) - this.options.height;
        }
        this.velocityY = 0;
      } else { p.y = nextY; this.grounded = false; }
    }
    this.stepOffset *= Math.exp(-14 * delta);
  }

  /** Move without gravity while retaining solid-block collision on every axis. */
  fly(delta: number, velocityX: number, velocityY: number, velocityZ: number) {
    const steps = Math.max(1, Math.ceil(delta / (1 / 120)));
    const dt = delta / steps;
    this.velocityY = 0;
    this.grounded = false;
    for (let step = 0; step < steps; step++) {
      this.moveFree("x", velocityX * dt);
      this.moveFree("z", velocityZ * dt);
      this.moveFree("y", velocityY * dt);
    }
    this.stepOffset *= Math.exp(-14 * delta);
  }

  private moveHorizontal(axis: "x" | "z", amount: number) {
    if (amount === 0) return;
    const p = this.position;
    const x = p.x + (axis === "x" ? amount : 0);
    const z = p.z + (axis === "z" ? amount : 0);
    if (this.grounded && this.world.getTerrainHeight) {
      const current = this.world.getTerrainHeight(p.x, p.z, p.y - 0.05, p.y + 0.05);
      if (current !== undefined) {
        const ground = this.world.getTerrainHeight(x, z, p.y - this.options.stepHeight, p.y + this.options.stepHeight);
        // Follow slopes in both directions. A cliff is a fall, not a ground snap;
        // steep uphill faces cannot be climbed by repeatedly stepping up them.
        const maxRise = Math.abs(amount) * 1.5 + 0.001;
        if (ground !== undefined && ground - p.y > maxRise) return;
        if (ground !== undefined && Math.abs(ground - p.y) <= maxRise && !this.collides(x, ground, z)) {
          p.y = ground;
          p[axis] += amount;
          return;
        }
      }
    }
    if (!this.collides(x, p.y, z)) { p[axis] += amount; return; }
    if (!this.grounded) return;
    const raised = Math.floor(p.y + 0.001) + this.options.stepHeight;
    if (!this.collides(p.x, raised, p.z) && !this.collides(x, raised, z)) {
      this.stepOffset += raised - p.y;
      p.y = raised;
      p[axis] += amount;
    }
  }

  private moveFree(axis: "x" | "y" | "z", amount: number) {
    if (amount === 0) return;
    const p = this.position;
    const next = { x: p.x, y: p.y, z: p.z };
    next[axis] += amount;
    if (!this.collides(next.x, next.y, next.z)) p[axis] = next[axis];
  }
}
