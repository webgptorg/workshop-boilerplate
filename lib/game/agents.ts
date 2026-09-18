import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { BLOCK } from "./blocks";
import { CharacterBody } from "./physics";
import { GeometryBuffer } from "./rendering/geometry";
import { StateMachine } from "./state-machine";
import { hash } from "./terrain/noise";
import type { GameSystem, RGB, Vec3 } from "./types";
import type { VoxelWorld } from "./world";

interface CreatureContext {
  body: CharacterBody;
  player: Vec3;
  heading: number;
  speed: number;
  decision: number;
  seed: number;
  home: Vec3;
}

type CreatureState = "idle" | "wander" | "avoid";

function createBehavior(context: CreatureContext) {
  const close = (ctx: CreatureContext) => Math.hypot(ctx.body.position.x - ctx.player.x, ctx.body.position.z - ctx.player.z) < 3.8;
  return new StateMachine<CreatureContext, CreatureState>("idle", context, {
    idle: {
      enter: (ctx) => { ctx.speed = 0; },
      transitions: [
        { to: "avoid", when: close },
        { to: "wander", when: (ctx, elapsed) => elapsed > 2 + hash(ctx.seed, ctx.decision, 17) * 4 },
      ],
    },
    wander: {
      enter: (ctx) => {
        ctx.heading = hash(ctx.seed, ctx.decision++, 19) * Math.PI * 2;
        if (Math.hypot(ctx.body.position.x - ctx.home.x, ctx.body.position.z - ctx.home.z) > 15) ctx.heading = Math.atan2(ctx.home.x - ctx.body.position.x, ctx.home.z - ctx.body.position.z);
        ctx.speed = 0.65;
      },
      transitions: [{ to: "avoid", when: close }, { to: "idle", when: (_, elapsed) => elapsed > 3.8 }],
    },
    avoid: {
      update: (ctx) => {
        ctx.heading = Math.atan2(ctx.body.position.x - ctx.player.x, ctx.body.position.z - ctx.player.z);
        ctx.speed = 1.9;
      },
      transitions: [{ to: "idle", when: (ctx, elapsed) => !close(ctx) && elapsed > 1.5 }],
    },
  });
}

/** A content plugin owns its geometry and behavior; the world never knows about sheep. */
export interface CreaturePlugin {
  readonly id: string;
  createModel(scene: Scene, material: StandardMaterial): { root: TransformNode; legs: Mesh[] };
  createBehavior: typeof createBehavior;
}

export const sheepPlugin: CreaturePlugin = {
  id: "meadow-sheep",
  createBehavior,
  createModel(scene, material) {
    const root = new TransformNode("sheep", scene);
    const wool: RGB = [0.88, 0.87, 0.75];
    const skin: RGB = [0.53, 0.49, 0.39];
    const geometry = new GeometryBuffer();
    geometry.box({ x: -0.37, y: 0.36, z: -0.52 }, { x: 0.74, y: 0.59, z: 1.04 }, wool);
    geometry.box({ x: -0.27, y: 0.54, z: 0.45 }, { x: 0.54, y: 0.48, z: 0.42 }, wool);
    geometry.box({ x: -0.21, y: 0.52, z: 0.80 }, { x: 0.42, y: 0.31, z: 0.14 }, skin);
    geometry.box({ x: -0.36, y: 0.73, z: 0.63 }, { x: 0.13, y: 0.12, z: 0.17 }, skin);
    geometry.box({ x: 0.23, y: 0.73, z: 0.63 }, { x: 0.13, y: 0.12, z: 0.17 }, skin);
    for (const x of [-0.17, 0.11]) geometry.box({ x, y: 0.76, z: 0.928 }, { x: 0.06, y: 0.065, z: 0.015 }, [0.16, 0.19, 0.17]);
    const body = new Mesh("sheep-body", scene);
    geometry.apply(body);
    body.material = material;
    body.parent = root;
    body.isPickable = false;
    body.receiveShadows = true;
    const legs: Mesh[] = [];
    for (const x of [-0.25, 0.25]) {
      for (const z of [-0.34, 0.34]) {
        const leg = new Mesh("sheep-leg", scene);
        const data = new GeometryBuffer();
        data.box({ x: -0.075, y: -0.34, z: -0.075 }, { x: 0.15, y: 0.38, z: 0.15 }, skin);
        data.apply(leg);
        leg.material = material;
        leg.parent = root;
        leg.position.set(x, 0.34, z);
        leg.isPickable = false;
        legs.push(leg);
      }
    }
    return { root, legs };
  },
};

export class CreatureSystem implements GameSystem {
  private readonly creatures: {
    model: ReturnType<CreaturePlugin["createModel"]>;
    context: CreatureContext;
    machine: StateMachine<CreatureContext, CreatureState>;
    time: number;
  }[] = [];

  constructor(
    readonly world: VoxelWorld,
    readonly scene: Scene,
    readonly material: StandardMaterial,
    readonly shadows: ShadowGenerator,
    readonly player: Vec3,
    readonly plugin: CreaturePlugin = sheepPlugin,
  ) {
    for (let i = 0; i < 4; i++) this.spawn(i);
  }

  private spawn(seed: number) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const angle = hash(seed, attempt, 491) * Math.PI * 2;
      const distance = 9 + hash(seed, attempt, 892) * 24;
      const x = Math.floor(this.player.x + Math.sin(angle) * distance) + 0.5;
      const z = Math.floor(this.player.z + Math.cos(angle) * distance) + 0.5;
      const column = this.world.generator.column(x, z);
      if (column.height < 3 || column.biome.surface !== BLOCK.grass) continue;
      const home = { x, y: column.height + 1, z };
      const body = new CharacterBody(this.world, home, { radius: 0.4, height: 1.1, gravity: 25, stepHeight: 1 });
      if (body.collides(x, home.y, z)) continue;
      const model = this.plugin.createModel(this.scene, this.material);
      for (const mesh of model.root.getChildMeshes()) this.shadows.addShadowCaster(mesh);
      const context: CreatureContext = { body, player: this.player, heading: angle, speed: 0, decision: 0, seed, home };
      this.creatures.push({ model, context, machine: this.plugin.createBehavior(context), time: seed });
      return;
    }
  }

  update(delta: number) {
    for (const creature of this.creatures) {
      const { context, model, machine } = creature;
      if (Math.hypot(context.body.position.x - this.player.x, context.body.position.z - this.player.z) > 75) {
        model.root.setEnabled(false);
        continue;
      }
      model.root.setEnabled(true);
      machine.update(delta);
      let speed = context.speed;
      const p = context.body.position;
      const aheadX = p.x + Math.sin(context.heading) * 1.2;
      const aheadZ = p.z + Math.cos(context.heading) * 1.2;
      // Keep creatures on dry, walkable ground, including edited terrain.
      if (!this.world.isSolid(aheadX, p.y - 1, aheadZ) && !this.world.isSolid(aheadX, p.y, aheadZ)) {
        context.heading += delta * 3;
        speed = 0;
      }
      if (this.world.getBlock(aheadX, p.y, aheadZ) === BLOCK.water) speed = 0;
      context.body.update(delta, Math.sin(context.heading) * speed, Math.cos(context.heading) * speed);
      creature.time += delta * speed * 6;
      model.root.position.set(p.x, p.y - context.body.stepOffset, p.z);
      const difference = Math.atan2(Math.sin(context.heading - model.root.rotation.y), Math.cos(context.heading - model.root.rotation.y));
      model.root.rotation.y += difference * Math.min(1, delta * 5);
      model.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(creature.time + (i % 2) * Math.PI) * Math.min(speed, 1) * 0.35; });
    }
  }

  dispose() {
    for (const creature of this.creatures) {
      for (const mesh of creature.model.root.getChildMeshes()) this.shadows.removeShadowCaster(mesh);
      creature.model.root.dispose();
    }
    this.creatures.length = 0;
  }
}
