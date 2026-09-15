import {
  buildingById,
  initialBuildings,
  type BuildingId,
  type PlacedBuilding,
} from "./buildings";
import {
  drawBuilding,
  drawScenery,
  polygon,
  project,
  unproject,
} from "./models";
import {
  hash,
  landscape,
  naturalAt,
  sampleTerrain,
  type Color,
  type TerrainSample,
} from "./world";

export interface Camera {
  x: number;
  y: number;
}
export interface Cell {
  x: number;
  y: number;
}
interface Vertex {
  x: number;
  y: number;
  height: number;
  color: Color;
  water: boolean;
  elevation: number;
}
export class World {
  buildings: PlacedBuilding[] = [];
  private occupiedCells = new Set<string>();
  private vertices = new Map<string, Vertex>();
  private naturals = new Map<
    string,
    { kind: ReturnType<typeof naturalAt>; height: number }
  >();
  private terrainCache: {
    surface: HTMLCanvasElement;
    camera: Camera;
    width: number;
    height: number;
    ratio: number;
  } | null = null;
  constructor(
    private readonly createSurface?: (
      width: number,
      height: number,
    ) => HTMLCanvasElement,
  ) {
    for (const b of initialBuildings) {
      if (this.canPlace(b.type, b.x, b.y, false)) this.addBuilding({ ...b });
      else if (b.owner === "ai") {
        for (let r = 1; r < 25; r++) {
          let placed = false;
          for (let dx = -r; dx <= r; dx++) {
            if (this.canPlace(b.type, b.x + dx, b.y - r, false)) {
              this.addBuilding({ ...b, x: b.x + dx, y: b.y - r });
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
      }
    }
  }
  private addBuilding(building: PlacedBuilding) {
    this.buildings.push(building);
    const size = buildingById(building.type).size;
    for (let x = building.x; x < building.x + size; x++) {
      for (let y = building.y; y < building.y + size; y++)
        this.occupiedCells.add(`${x},${y}`);
    }
  }
  occupied(x: number, y: number) {
    return this.occupiedCells.has(`${x},${y}`);
  }
  natural(x: number, y: number) {
    const key = `${x},${y}`;
    if (!this.naturals.has(key))
      this.naturals.set(key, {
        kind: naturalAt(x, y),
        height: sampleTerrain(x + 0.5, y + 0.5).height,
      });
    return this.naturals.get(key)?.kind ?? null;
  }
  canPlace(type: BuildingId, x: number, y: number, checkScenery = true) {
    const b = buildingById(type);
    const heights: number[] = [];
    for (let dx = 0; dx < b.size; dx++)
      for (let dy = 0; dy < b.size; dy++) {
        const tx = x + dx,
          ty = y + dy;
        const samples = [
          sampleTerrain(tx, ty),
          sampleTerrain(tx + 1, ty),
          sampleTerrain(tx, ty + 1),
          sampleTerrain(tx + 1, ty + 1),
          sampleTerrain(tx + 0.5, ty + 0.5),
        ];
        if (
          samples.some((t) => !t.buildable) ||
          this.occupied(tx, ty) ||
          (checkScenery && this.natural(tx, ty))
        )
          return false;
        heights.push(...samples.map((s) => s.height));
      }
    return Math.max(...heights) - Math.min(...heights) < 10;
  }
  place(type: BuildingId, x: number, y: number) {
    if (!this.canPlace(type, x, y)) return false;
    this.addBuilding({
      id: `built-${Date.now()}-${this.buildings.length}`,
      type,
      x,
      y,
      owner: "player",
    });
    return true;
  }
  restore(value: unknown) {
    if (!Array.isArray(value)) return;
    for (const item of value) {
      if (typeof item !== "object" || item === null) continue;
      const b = item as Partial<PlacedBuilding>;
      if (
        typeof b.type !== "string" ||
        !Number.isSafeInteger(b.x) ||
        !Number.isSafeInteger(b.y)
      )
        continue;
      const definition = buildingById(b.type);
      if (definition && b.x !== undefined && b.y !== undefined)
        this.place(b.type, b.x, b.y);
    }
  }
  private vertex(x: number, y: number): Vertex {
    const key = `${x},${y}`;
    const cached = this.vertices.get(key);
    if (cached) return cached;
    const wx = x + (hash(x, y, 71) - 0.5) * 0.65,
      wy = y + (hash(x, y, 98) - 0.5) * 0.65;
    const t = sampleTerrain(wx, wy),
      variation = (hash(x, y, 411) - 0.5) * (t.type === "water" ? 3 : 9);
    const value: Vertex = {
      x: wx,
      y: wy,
      height: t.height,
      color: [
        t.color[0] + variation,
        t.color[1] + variation,
        t.color[2] + variation,
      ],
      water: t.type === "water",
      elevation: landscape(wx, wy).elevation,
    };
    this.vertices.set(key, value);
    return value;
  }
  pick(px: number, py: number, camera: Camera): Cell {
    let [x, y] = unproject(px - camera.x, py - camera.y);
    for (let i = 0; i < 4; i++)
      [x, y] = unproject(
        px - camera.x,
        py - camera.y + sampleTerrain(x, y).height,
      );
    return { x: Math.floor(x), y: Math.floor(y) };
  }
  private paintTerrain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    camera: Camera,
  ) {
    const corners = [
      [0, -120],
      [width, -120],
      [0, height + 150],
      [width, height + 150],
    ].map(([x, y]) => unproject(x - camera.x, y - camera.y));
    const minX = Math.floor(Math.min(...corners.map((p) => p[0]))) - 2,
      maxX = Math.ceil(Math.max(...corners.map((p) => p[0]))) + 2;
    const minY = Math.floor(Math.min(...corners.map((p) => p[1]))) - 2,
      maxY = Math.ceil(Math.max(...corners.map((p) => p[1]))) + 2;
    ctx.save();
    ctx.translate(camera.x, camera.y);
    const fill = (vertices: Vertex[], water = false) => {
      if (vertices.length < 3) return;
      const color = water
        ? "#43858b"
        : `rgb(${[0, 1, 2].map((i) => Math.round(vertices.reduce((sum, v) => sum + v.color[i], 0) / vertices.length)).join(" ")})`;
      polygon(
        ctx,
        vertices.map((v) => project(v.x, v.y, v.height)),
        color,
        color,
      );
    };
    const triangle = (a: Vertex, b: Vertex, c: Vertex) => {
      const vertices = [a, b, c];
      if (vertices.every((v) => v.water)) {
        fill(vertices, true);
        return;
      }
      if (vertices.every((v) => !v.water)) {
        fill(vertices);
        return;
      }
      // Clip both surfaces to the exact same coastline instead of blending water into ground.
      const land: Vertex[] = [],
        water: Vertex[] = [];
      vertices.forEach((v, i) => {
        const next = vertices[(i + 1) % 3];
        (v.water ? water : land).push(v);
        if (v.water !== next.water) {
          const t = v.elevation / (v.elevation - next.elevation);
          const shore: Vertex = {
            x: v.x + (next.x - v.x) * t,
            y: v.y + (next.y - v.y) * t,
            height: 0,
            color: [211, 199, 151],
            water: false,
            elevation: 0,
          };
          land.push(shore);
          water.push(shore);
        }
      });
      fill(water, true);
      fill(land);
    };
    for (let sum = minX + minY; sum <= maxX + maxY; sum++)
      for (let x = minX; x <= maxX; x++) {
        const y = sum - x;
        if (y < minY || y > maxY) continue;
        const a = this.vertex(x, y),
          b = this.vertex(x + 1, y),
          c = this.vertex(x + 1, y + 1),
          d = this.vertex(x, y + 1);
        if (hash(x, y) > 0.5) {
          triangle(a, b, c);
          triangle(a, c, d);
        } else {
          triangle(a, b, d);
          triangle(b, c, d);
        }
        if (
          a.water &&
          b.water &&
          c.water &&
          d.water &&
          hash(x, y, 562) > 0.86
        ) {
          const p = project(x + 0.5, y + 0.5);
          ctx.strokeStyle = "#9ec2b43c";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p[0] - 4, p[1]);
          ctx.lineTo(p[0] + 5 + hash(x, y) * 8, p[1]);
          ctx.stroke();
        }
      }
    ctx.restore();
  }
  private renderTerrain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    camera: Camera,
  ) {
    if (!this.createSurface) {
      this.paintTerrain(ctx, width, height, camera);
      return;
    }
    const padding = 192,
      ratio = ctx.getTransform().a;
    let cache = this.terrainCache;
    if (
      !cache ||
      cache.width !== width ||
      cache.height !== height ||
      cache.ratio !== ratio ||
      Math.abs(camera.x - cache.camera.x) > padding - 24 ||
      Math.abs(camera.y - cache.camera.y) > padding - 24
    ) {
      const surface = cache?.surface ?? this.createSurface(1, 1);
      surface.width = Math.ceil((width + padding * 2) * ratio);
      surface.height = Math.ceil((height + padding * 2) * ratio);
      const offscreen = surface.getContext("2d");
      if (!offscreen) {
        this.paintTerrain(ctx, width, height, camera);
        return;
      }
      offscreen.scale(ratio, ratio);
      this.paintTerrain(offscreen, width + padding * 2, height + padding * 2, {
        x: camera.x + padding,
        y: camera.y + padding,
      });
      cache = { surface, camera: { ...camera }, width, height, ratio };
      this.terrainCache = cache;
    }
    ctx.drawImage(
      cache.surface,
      camera.x - cache.camera.x - padding,
      camera.y - cache.camera.y - padding,
      cache.surface.width / ratio,
      cache.surface.height / ratio,
    );
  }
  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    camera: Camera,
    selected: BuildingId | null,
    hover: Cell | null,
  ) {
    ctx.fillStyle = "#43858b";
    ctx.fillRect(0, 0, width, height);
    const corners = [
      [-150, -150],
      [width + 150, -150],
      [-150, height + 200],
      [width + 150, height + 200],
    ].map(([x, y]) => unproject(x - camera.x, y - camera.y));
    const minX = Math.floor(Math.min(...corners.map((p) => p[0]))) - 2,
      maxX = Math.ceil(Math.max(...corners.map((p) => p[0]))) + 2;
    const minY = Math.floor(Math.min(...corners.map((p) => p[1]))) - 2,
      maxY = Math.ceil(Math.max(...corners.map((p) => p[1]))) + 2;
    this.renderTerrain(ctx, width, height, camera);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    // Terrain is complete before the independent, depth-sorted object layer is painted.
    const objects: { depth: number; draw: () => void }[] = [];
    for (let x = minX; x <= maxX; x++)
      for (let y = minY; y <= maxY; y++) {
        if (this.occupied(x, y)) continue;
        const kind = this.natural(x, y);
        if (!kind) continue;
        const p = project(x, y, this.naturals.get(`${x},${y}`)?.height ?? 0);
        if (
          p[0] + camera.x < -100 ||
          p[0] + camera.x > width + 100 ||
          p[1] + camera.y < -100 ||
          p[1] + camera.y > height + 120
        )
          continue;
        objects.push({
          depth: x + y + 1,
          draw: () => {
            ctx.save();
            ctx.translate(...p);
            drawScenery(ctx, kind, x, y);
            ctx.restore();
          },
        });
      }
    for (const b of this.buildings) {
      const definition = buildingById(b.type),
        s = definition.size;
      const p = project(
        b.x,
        b.y,
        sampleTerrain(b.x + s / 2, b.y + s / 2).height,
      );
      objects.push({
        depth: b.x + b.y + s,
        draw: () => {
          ctx.save();
          ctx.translate(...p);
          drawBuilding(ctx, definition, b.owner === "ai");
          ctx.restore();
        },
      });
    }
    if (selected && hover) {
      const b = buildingById(selected),
        s = b.size,
        valid = this.canPlace(selected, hover.x, hover.y);
      const terrain: TerrainSample = sampleTerrain(
        hover.x + s / 2,
        hover.y + s / 2,
      );
      const points = [
        [hover.x, hover.y],
        [hover.x + s, hover.y],
        [hover.x + s, hover.y + s],
        [hover.x, hover.y + s],
      ].map(([x, y]) => project(x, y, terrain.height + 1));
      polygon(ctx, points, valid ? "#eaf2c33d" : "#bd625563");
      ctx.beginPath();
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = valid ? "#f1f3d2" : "#dc9180";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      objects.push({
        depth: hover.x + hover.y + s,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = valid ? 0.72 : 0.36;
          ctx.translate(...project(hover.x, hover.y, terrain.height));
          drawBuilding(ctx, b);
          ctx.restore();
        },
      });
    }
    objects.sort((a, b) => a.depth - b.depth).forEach((o) => o.draw());
    ctx.restore();
    // Bounded caches support indefinite exploration without retaining the whole world.
    if (this.vertices.size > 45000) this.vertices.clear();
    if (this.naturals.size > 30000) this.naturals.clear();
  }
}
