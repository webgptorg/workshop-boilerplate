import type { BuildingDefinition } from "./buildings";
import { hash, type SceneryId } from "./world";

export const TILE_WIDTH = 68;
export const TILE_HEIGHT = 34;
type Point = readonly [number, number];
type Point3 = readonly [number, number, number];
export const project = (x: number, y: number, z = 0): Point => [
  ((x - y) * TILE_WIDTH) / 2,
  ((x + y) * TILE_HEIGHT) / 2 - z,
];
export const unproject = (x: number, y: number): Point => [
  x / TILE_WIDTH + y / TILE_HEIGHT,
  y / TILE_HEIGHT - x / TILE_WIDTH,
];
export function polygon(
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  color: string,
  stroke?: string,
) {
  ctx.beginPath();
  points.forEach(([x, y], i) =>
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.65;
    ctx.stroke();
  }
}
function face(
  ctx: CanvasRenderingContext2D,
  points: readonly Point3[],
  color: string,
) {
  polygon(
    ctx,
    points.map(([x, y, z]) => project(x, y, z)),
    color,
  );
}
function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  colors = ["#e5d8b8", "#c9bc9c", "#eee1c3"],
  z = 0,
) {
  face(
    ctx,
    [
      [x, y + d, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ],
    colors[0],
  );
  face(
    ctx,
    [
      [x + w, y, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x + w, y, z + h],
    ],
    colors[1],
  );
  face(
    ctx,
    [
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ],
    colors[2],
  );
}
function roof(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  d: number,
  z: number,
  rise: number,
  color: string,
) {
  face(
    ctx,
    [
      [x + w, y, z],
      [x + w, y + d, z],
      [x + w, y + d / 2, z + rise],
    ],
    "#dfccac",
  );
  face(
    ctx,
    [
      [x, y + d, z],
      [x + w, y + d, z],
      [x + w, y + d / 2, z + rise],
      [x, y + d / 2, z + rise],
    ],
    color,
  );
  face(
    ctx,
    [
      [x, y, z],
      [x + w, y, z],
      [x + w, y + d / 2, z + rise],
      [x, y + d / 2, z + rise],
    ],
    "#c48b67",
  );
  for (let i = 1; i < 5; i++) {
    const a = project(x + (w * i) / 5, y + d, z),
      b = project(x + (w * i) / 5, y + d / 2, z + rise);
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.strokeStyle = "#694c392b";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}
function windowFront(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  z: number,
  width = 0.13,
  height = 6,
) {
  face(
    ctx,
    [
      [x, y, z],
      [x + width, y, z],
      [x + width, y, z + height],
      [x, y, z + height],
    ],
    "#655b49",
  );
  face(
    ctx,
    [
      [x + 0.025, y + 0.005, z + 1],
      [x + width - 0.025, y + 0.005, z + 1],
      [x + width - 0.025, y + 0.005, z + height - 1],
      [x + 0.025, y + 0.005, z + height - 1],
    ],
    "#d6b16c",
  );
}
function flag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  z: number,
  ai: boolean,
) {
  const p = project(x, y, z),
    tip = project(x, y, z + 21);
  ctx.strokeStyle = "#685f4c";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(...p);
  ctx.lineTo(...tip);
  ctx.stroke();
  polygon(
    ctx,
    [
      tip,
      [tip[0] + 13, tip[1] + 3],
      [tip[0] + 10, tip[1] + 10],
      [tip[0], tip[1] + 7],
    ],
    ai ? "#a65446" : "#6d9898",
  );
}
function house(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  d: number,
  h: number,
  color: string,
) {
  box(ctx, x - 0.04, y - 0.04, w + 0.08, d + 0.08, 3, [
    "#aaa48a",
    "#a19c85",
    "#c5bea3",
  ]);
  box(ctx, x, y, w, d, h);
  for (const t of [0, 0.48, 0.96])
    box(ctx, x + w * t, y + d - 0.035, 0.038, 0.045, h, [
      "#826a4c",
      "#826a4c",
      "#9e805c",
    ]);
  box(
    ctx,
    x,
    y + d - 0.035,
    w,
    0.045,
    2,
    ["#826a4c", "#826a4c", "#9e805c"],
    h * 0.55,
  );
  windowFront(ctx, x + w * 0.18, y + d + 0.004, h * 0.61);
  windowFront(ctx, x + w * 0.69, y + d + 0.004, h * 0.61);
  face(
    ctx,
    [
      [x + w * 0.42, y + d + 0.01, 0],
      [x + w * 0.6, y + d + 0.01, 0],
      [x + w * 0.6, y + d + 0.01, 10],
      [x + w * 0.42, y + d + 0.01, 10],
    ],
    "#715c43",
  );
  roof(ctx, x - 0.09, y - 0.09, w + 0.18, d + 0.18, h, 13, color);
}
/** A single emissive, flat-color model renderer is used by the world and all dock previews. */
export type BuildingModel =
  | "hall"
  | "cottage"
  | "farm"
  | "fort"
  | "market"
  | "workshop"
  | "forge"
  | "stable"
  | "tower";
type ModelRenderer = (
  ctx: CanvasRenderingContext2D,
  b: BuildingDefinition,
  ai: boolean,
) => void;
function craftHouse(ctx: CanvasRenderingContext2D, b: BuildingDefinition) {
  const s = b.size,
    h = b.height;
  house(ctx, 0.12, 0.12, s - 0.24, s - 0.24, h, b.roof);
  if (b.model === "forge" || b.model === "workshop") {
    box(ctx, 0.66, 0.17, 0.22, 0.24, h + 18, ["#a1a69a", "#838f88", "#bec0ad"]);
    box(
      ctx,
      0.63,
      0.14,
      0.28,
      0.3,
      3,
      ["#8c968e", "#78867e", "#666d65"],
      h + 18,
    );
    box(ctx, 0.75, 0.83, 0.28, 0.22, 8, ["#907957", "#806b4f", "#b39b74"]);
    if (b.model === "forge") windowFront(ctx, 0.3, 0.89, 2, 0.25, 8);
  }
}
/** Model plugins have the same signature; neither the dock nor engine branches on content. */
export const buildingModels: Record<BuildingModel, ModelRenderer> = {
  farm: (ctx, b) => {
    const h = b.height;

    box(ctx, 0.07, 0.06, 1.85, 1.85, 1, ["#b39966", "#b39966", "#ac925d"]);
    for (let i = 0; i < 8; i++) {
      box(ctx, 0.13 + i * 0.22, 0.64, 0.11, 1.2, 2, [
        "#bda45e",
        "#bda45e",
        "#d2bb6c",
      ]);
      for (let j = 0; j < 5; j++)
        box(ctx, 0.13 + i * 0.22, 0.72 + j * 0.22, 0.045, 0.035, 4, [
          "#e2cd80",
          "#c0aa61",
          "#e4cf81",
        ]);
    }
    house(ctx, 0.16, 0.1, 0.68, 0.46, h, b.roof);
    fence(ctx, 0.06, 1.95, 1.9);
  },
  tower: (ctx, b, ai) => {
    const h = b.height;

    box(ctx, 0.2, 0.2, 0.6, 0.6, h, ["#c7c6b0", "#a5afa1", "#d7d4bd"]);
    windowFront(ctx, 0.43, 0.805, 18, 0.12, 9);
    box(
      ctx,
      0.06,
      0.06,
      0.88,
      0.88,
      13,
      ["#cbbc98", "#b2aa8b", "#d6c8a6"],
      h - 3,
    );
    for (const x of [0.17, 0.43, 0.69]) windowFront(ctx, x, 0.95, h, 0.12, 7);
    roof(ctx, -0.04, -0.04, 1.08, 1.08, h + 10, 17, b.roof);
    flag(ctx, 0.5, 0.5, h + 28, ai);
  },
  hall: (ctx, b, ai) => {
    const h = b.height;

    box(ctx, 0.25, 0.35, 0.48, 0.48, 48, ["#ddd4b8", "#bfc2a9", "#e9dec1"]);
    windowFront(ctx, 0.41, 0.835, 32, 0.14, 8);
    roof(ctx, 0.16, 0.26, 0.66, 0.66, 48, 15, b.roof);
    flag(ctx, 0.5, 0.55, 64, ai);
    house(ctx, 0.18, 0.35, 1.6, 1.32, h, b.roof);
    house(ctx, 0.72, 1.15, 0.62, 0.62, h + 3, b.roof);
    for (let i = 0; i < 3; i++)
      box(ctx, 0.78, 1.79 + i * 0.07, 0.48, 0.09, 3 - i, [
        "#c9c5ac",
        "#b4b59d",
        "#dfd5ba",
      ]);
  },
  market: (ctx, b) => {
    const h = b.height;

    house(ctx, 0.15, 0.12, 1.65, 0.65, h, b.roof);
    for (let i = 0; i < 3; i++) {
      const x = 0.15 + i * 0.57;
      box(ctx, x, 1.1, 0.49, 0.6, 9, ["#aa8157", "#8e7451", "#d7b77e"]);
      for (const dx of [0, 0.46])
        box(ctx, x + dx, 1.65, 0.035, 0.035, 23, [
          "#806b4d",
          "#806b4d",
          "#806b4d",
        ]);
      for (let j = 0; j < 4; j++)
        face(
          ctx,
          [
            [x + j * 0.125, 1, 25],
            [x + (j + 1) * 0.125, 1, 25],
            [x + (j + 1) * 0.125, 1.8, 21],
            [x + j * 0.125, 1.8, 21],
          ],
          j % 2 ? "#e6d8af" : "#799a91",
        );
      box(
        ctx,
        x + 0.05,
        1.35,
        0.14,
        0.15,
        3,
        ["#a96947", "#a96947", "#ce955f"],
        9,
      );
    }
  },
  fort: (ctx, b, ai) => {
    const h = b.height;

    house(ctx, 0.14, 0.25, 1.7, 1.4, h, b.roof);
    for (const x of [0.1, 1.45]) {
      box(ctx, x, 1.3, 0.45, 0.45, 37, ["#c2c2ad", "#aab09e", "#d3d0b8"]);
      for (const dx of [0, 0.3])
        for (const dy of [0, 0.3])
          box(ctx, x + dx, 1.3 + dy, 0.15, 0.15, 5, undefined, 37);
      windowFront(ctx, x + 0.17, 1.76, 23, 0.1, 8);
    }
    flag(ctx, 0.4, 0.5, 45, ai);
  },
  stable: (ctx, b) => {
    const h = b.height;

    house(ctx, 0.13, 0.2, 1.72, 1.25, h, b.roof);
    for (let i = 0; i < 3; i++)
      face(
        ctx,
        [
          [0.25 + i * 0.5, 1.46, 0],
          [0.62 + i * 0.5, 1.46, 0],
          [0.62 + i * 0.5, 1.46, 15],
          [0.25 + i * 0.5, 1.46, 15],
        ],
        "#786a4d",
      );
    fence(ctx, 0.15, 1.91, 1.7);
    box(ctx, 1.5, 1.6, 0.28, 0.24, 7, ["#c5aa67", "#baa064", "#ddc383"]);
  },
  cottage: craftHouse,
  workshop: craftHouse,
  forge: craftHouse,
};
export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: BuildingDefinition,
  ai = false,
) {
  buildingModels[b.model](ctx, b, ai);
}

function fence(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  for (let i = 0; i <= 4; i++)
    box(ctx, x + (w * i) / 4, y, 0.035, 0.035, 8, [
      "#9d8a61",
      "#9d8a61",
      "#b9a477",
    ]);
  box(ctx, x, y, w, 0.025, 1.7, ["#b5a075", "#9c8860", "#c1ae83"], 5);
}
type SceneryRenderer = (
  ctx: CanvasRenderingContext2D,
  variation: number,
) => void;
export const sceneryModels: Record<SceneryId, SceneryRenderer> = {
  tree: (ctx, r) => {
    const h = 28 + r * 26;
    box(ctx, 0.45, 0.45, 0.1, 0.1, 13, ["#857653", "#857653", "#9d8c61"]);
    if (r > 0.38) {
      for (let i = 0; i < 3; i++) {
        const z = 10 + i * h * 0.23,
          w = 0.53 - i * 0.115;
        face(
          ctx,
          [
            [0.5 - w, 0.5, z],
            [0.5, 0.5 + w, z],
            [0.5, 0.5, z + h * 0.6],
          ],
          i % 2 ? "#658565" : "#72916b",
        );
        face(
          ctx,
          [
            [0.5, 0.5 + w, z],
            [0.5 + w, 0.5, z],
            [0.5, 0.5, z + h * 0.6],
          ],
          i % 2 ? "#577b61" : "#628666",
        );
        face(
          ctx,
          [
            [0.5 - w, 0.5, z],
            [0.5, 0.5 - w, z],
            [0.5, 0.5, z + h * 0.6],
          ],
          "#83a077",
        );
      }
    } else {
      const p = project(0.5, 0.5, 12),
        w = 16 + r * 15;
      polygon(
        ctx,
        [
          [p[0] - w, p[1] - 12],
          [p[0] - w * 0.75, p[1] - h * 0.8],
          [p[0] + w * 0.15, p[1] - h],
          [p[0] + w, p[1] - h * 0.65],
          [p[0] + w, p[1] - 9],
          [p[0], p[1] + 2],
        ],
        "#7b995e",
      );
      polygon(
        ctx,
        [
          [p[0] - w, p[1] - 12],
          [p[0] - w * 0.75, p[1] - h * 0.8],
          [p[0] + w * 0.15, p[1] - h],
          [p[0] + w * 0.2, p[1] - h * 0.35],
        ],
        "#94ad70",
      );
      polygon(
        ctx,
        [
          [p[0] + w * 0.2, p[1] - h * 0.35],
          [p[0] + w * 0.15, p[1] - h],
          [p[0] + w, p[1] - h * 0.65],
          [p[0] + w, p[1] - 9],
          [p[0], p[1] + 2],
        ],
        "#718e58",
      );
    }
  },
  rock: (ctx, r) => {
    const h = 7 + r * 13;
    face(
      ctx,
      [
        [0.08, 0.4, 0],
        [0.5, 0.85, 0],
        [0.72, 0.7, h],
        [0.22, 0.35, h * 0.8],
      ],
      "#a6afa2",
    );
    face(
      ctx,
      [
        [0.5, 0.85, 0],
        [0.95, 0.4, 0],
        [0.76, 0.25, h * 0.7],
        [0.72, 0.7, h],
      ],
      "#8e9b93",
    );
    face(
      ctx,
      [
        [0.22, 0.35, h * 0.8],
        [0.72, 0.7, h],
        [0.76, 0.25, h * 0.7],
        [0.45, 0.13, h * 1.1],
      ],
      "#c0c5b6",
    );
  },
  bush: (ctx) => {
    for (let i = 0; i < 3; i++) {
      const p = project(0.3 + i * 0.19, 0.5, 0),
        w = 7;
      polygon(
        ctx,
        [
          [p[0] - w, p[1]],
          [p[0] - w, p[1] - 6],
          [p[0], p[1] - 11 - (i % 2) * 3],
          [p[0] + w, p[1] - 6],
          [p[0] + w, p[1]],
          [p[0], p[1] + 3],
        ],
        i % 2 ? "#8da369" : "#77935e",
      );
    }
  },
};
export function drawScenery(
  ctx: CanvasRenderingContext2D,
  type: SceneryId,
  x: number,
  y: number,
) {
  sceneryModels[type](ctx, hash(x, y, 909));
}
