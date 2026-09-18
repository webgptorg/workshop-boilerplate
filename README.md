# Voxel Garden

A full-screen, first-person creative sandbox built with Next.js, TypeScript, and Babylon.js. Explore a procedurally generated voxel world, place and remove blocks with unlimited materials, and encounter simple sheep AI.

The project began with [the original game brief](prompts/0000-game.md) and a Promptbook Next.js starter. The interface is a crosshair and a six-material glass dock, inspired by [this visual reference](prompts/screenshots/game.png). The game stays visually minimal, with no visible branding or extra HUD panels.

## Run

Use Node.js 20.9 or newer and npm. No API keys, environment variables, or backend service are required for the game. The build loads Google Fonts through `next/font/google`, so font fetching needs network access.

```bash
npm ci
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

Flying mode and smooth terrain surfaces are requested in [the flying prompt](prompts/0020-flying-mode.md) and [the terrain prompt](prompts/0010-smooth-terrain-graphic.md), but are not implemented in the current runtime. Double-tapping Space does not toggle flight; terrain remains rendered as voxels.

## World and persistence

A deterministic seed generates continuous terrain in 16×16 chunks: islands, beaches, river channels, hills, rocky mountains, deserts, forests, and meadows. Chunk data is authoritative for collision and editing; meshes only display it. Nearby chunks stream in while distant chunks and meshes are unloaded. Horizontal exploration has no fixed map boundary.

Only exposed faces are meshed, with vertex color variation, ambient occlusion, sunlight, shadows, and distance haze. Water shares one material with animated surface highlights. Placed water is a static voxel; fluid simulation is not implemented.

Block edits and the player's position are saved to this browser's local storage every few seconds and when leaving the page. Edits survive chunk unloading and reloading. If storage is unavailable or full, the session continues in memory. Saves are local to a browser and origin, not synchronized with a server.

The current storage key is `voxel-garden:world:v2`, defined in `lib/game/config.ts`. To reset a world, close the game, remove that key from the site's local storage using browser developer tools, then reopen the game. This deletes the saved edits and player position. Saves with a different seed or unsupported format version are ignored.

## Extend

| Module | Responsibility / extension point |
| --- | --- |
| `app/` | Next.js page, root layout, metadata, and global styles. |
| `lib/game/blocks.ts` | Register block definitions with stable numeric IDs, colors, collision properties, and dock availability. |
| `lib/game/terrain/biomes.ts` | Ordered biome plugins match climate samples and provide surface materials and vegetation settings. |
| `lib/game/terrain/features.ts` | Terrain feature plugins receive world coordinates and a bounded chunk writer. Features can safely cross chunk seams. |
| `lib/game/terrain/generator.ts` | Seeded terrain and chunk data generation. Accepts custom biome and feature lists. |
| `lib/game/world.ts` | Grid access, edits, persistence, invalidation, and bounded chunk caching. |
| `lib/game/rendering/` | Babylon materials, exposed-face meshing, custom detail shapes, streaming, and atmosphere. |
| `lib/game/physics.ts` | Renderer-independent character collision, gravity, jumping, and stepping. |
| `lib/game/input.ts` | Keyboard, mouse, pointer lock, drag fallback, and material selection input. |
| `lib/game/spawn.ts` | Finds a starting location on walkable terrain. |
| `lib/game/raycast.ts` | Grid ray traversal for reliable editing even when meshes are pending. |
| `lib/game/state-machine.ts` | Reusable typed state transitions, entry/exit actions, and timed updates. |
| `lib/game/agents.ts` | Creature content plugins pair a model with an AI state graph. |
| `lib/game/game.ts` | Composes the engine, input, world, and simulation systems; owns their lifecycle. |
| `components/game/` | Client boundary, accessible material dock, canvas, and exceptional loading/error states. |

Keep saved block IDs stable. Add content through the registries and plugin interfaces, and add simulation systems through the `GameSystem` interface. World, rendering, and movement settings live in `lib/game/config.ts`. The original Promptbook brand tokens are retained in `app/globals.css`; the game displays no branding.

Contributor and coding-agent rules are in [AGENTS.md](AGENTS.md). Shared React components belong in `components`, and shared utilities belong in `lib`.

## Verify

```bash
npm test
npm run check
npm run build
```

Tests cover deterministic generation, cross-chunk vegetation, persistent edits, invalid saves, collision, gravity, jumping, stepping, ray hits, AI transitions, and exposed-face meshing. `npm run check` runs ESLint and TypeScript; they can also be run separately with `npm run lint` and `npm run typecheck`.

Run `npm run start` after building to serve the production app. For rendering or input changes, also check movement, placement/removal, dock keyboard navigation, chunk streaming, and save/reload behavior in a WebGL-capable browser. Automated tests do not verify the visual experience.
