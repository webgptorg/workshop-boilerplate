# Voxel Garden

A full-screen, first-person creative sandbox built with Next.js, TypeScript, and Babylon.js. The interface is a crosshair and a six-material glass dock, inspired by `prompts/screenshots/game.png`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. A WebGL-capable desktop browser, keyboard, and mouse are required for the full controls. The dock also adapts to narrow screens.

## Controls

| Input | Action |
| --- | --- |
| W / A / S / D | Walk |
| Mouse / arrow keys | Look |
| Space | Jump; hold to rise in water |
| Shift | Run |
| Left click | Place the selected block and capture the mouse |
| Right click | Remove the targeted block |
| 1–6 / mouse wheel / dock | Select a material |
| Escape | Release mouse capture |

Mouse dragging remains available when pointer lock is unavailable. The dock supports Tab, arrow keys, Home, End, and Enter, with accessible material names and selection states.

Gravity, collision, and smoothly presented one-block steps keep the player on the terrain. Building uses unlimited grass, sand, rock, gravel, wood, and water. Sheep wander, pause, and avoid the player using deterministic AI; combat, multiplayer, resources, and turns are intentionally outside this map prototype.

## World and persistence

A deterministic seed generates continuous terrain in 16×16 chunks: islands, beaches, river channels, hills, rocky mountains, deserts, forests, and meadows. Chunk data is authoritative for collision and editing; meshes only display it. Nearby chunks stream in while distant chunks and meshes are unloaded. Horizontal exploration has no fixed map boundary.

Only exposed faces are meshed, with vertex color variation, ambient occlusion, sunlight, shadows, and distance haze. Water shares one material with animated surface highlights. Placed water is a static voxel; fluid simulation is not implemented.

The welcome screen lets you create, enter, and delete named worlds. Each world has a separate terrain seed and a URL such as `/worlds/my-world`. Duplicate names receive distinct URL suffixes. Use the Worlds link in the game to return to the welcome screen.

Each world is stored under `v3:voxel-garden:world:<id>`, with the prefix controlled by `SAVE_VERSION` in `lib/game/config.ts`. Older save versions are ignored; there is no migration or backward compatibility. The save includes the terrain seed, block edits, player position and view direction, flight mode, and selected material. It is updated every few seconds and when leaving the world or hiding the page. Edits survive chunk unloading and reloading. Save failures show an in-game warning. Saves are local to a browser and origin, not synchronized with a server; opening a world URL elsewhere does not transfer its save.

## Extend

| Module | Responsibility / extension point |
| --- | --- |
| `lib/game/blocks.ts` | Register block definitions with stable numeric IDs, colors, collision properties, and dock availability. |
| `lib/game/terrain/biomes.ts` | Ordered biome plugins match climate samples and provide surface materials and vegetation settings. |
| `lib/game/terrain/features.ts` | Terrain feature plugins receive world coordinates and a bounded chunk writer. Features can safely cross chunk seams. |
| `lib/game/terrain/generator.ts` | Seeded terrain and chunk data generation. Accepts custom biome and feature lists. |
| `lib/game/world.ts` | Grid access, edits, persistence, invalidation, and bounded chunk caching. |
| `lib/game/rendering/` | Babylon materials, exposed-face meshing, custom detail shapes, streaming, and atmosphere. |
| `lib/game/physics.ts` | Renderer-independent character collision, gravity, jumping, and stepping. |
| `lib/game/raycast.ts` | Grid ray traversal for reliable editing even when meshes are pending. |
| `lib/game/state-machine.ts` | Reusable typed state transitions, entry/exit actions, and timed updates. |
| `lib/game/agents.ts` | Creature content plugins pair a model with an AI state graph. |
| `lib/game/game.ts` | Composes the engine, input, world, and simulation systems; owns their lifecycle. |
| `components/game/` | Client boundary, accessible material dock, canvas, and exceptional loading/error states. |

Keep saved block IDs stable. Add content through the registries and plugin interfaces, and add simulation systems through the `GameSystem` interface. World, rendering, and movement settings live in `lib/game/config.ts`. The original Promptbook brand tokens are retained in `app/globals.css`; the game displays no branding.

## Verify

```bash
npm test
npm run check
npm run build
```

Tests cover deterministic generation, cross-chunk vegetation, persistent edits, invalid saves, collision, gravity, jumping, stepping, ray hits, and AI transitions. The production view can be tested with `npm run start` after building.
