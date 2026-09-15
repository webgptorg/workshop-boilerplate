# Stillwater

A small medieval city-building sandbox built with Next.js, React, and Canvas 2D.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Drag with a mouse or touch, or use the arrow keys to explore. Select a building from the dock and click clear ground to place it. Keys **1–9** select buildings; **Escape** cancels selection. Zoom is fixed.

Construction is free. Buildings save automatically in this browser under `stillwater-world-v1`. The world starts with a town center and a fixed rival settlement with red flags. The rival does not act yet; resources, turns, combat, and players are outside this prototype.

## Structure

- `lib/game/world.ts`: deterministic continuous landscape fields, terrain blend registry, and separate natural-object generation. Negative coordinates and new areas require no network requests.
- `lib/game/buildings.ts`: building definitions, footprints, and initial settlements.
- `lib/game/models.ts`: shared isometric projection, flat-color geometry, and building model plugins. The map and dock draw the exact same models. There are no lights or shadows.
- `lib/game/engine.ts`: placement, save validation, terrain mesh and coastline clipping, depth-sorted objects, and bounded rendering caches. A padded terrain surface is generated synchronously before it becomes visible.
- `components/game/game.tsx`: the client-side input, canvas lifecycle, persistence, and accessible dock. The surrounding page remains a Server Component.

Terrain cells and scenery are separate: forest bed is a terrain material, while trees occupy cells on top of it. Placement checks all cells and corners of a footprint for water, slope, scenery, and other buildings. The visible terrain uses a jittered triangle mesh and weighted material transitions; the construction grid is shown only under a placement preview.

## Add content

**Building:** add a definition to `buildings`, extend `BuildingId`, and either reuse a model or add a renderer to `buildingModels` and its `BuildingModel` type. Dock previews, selection, collision checks, and persistence consume the registry without changes to the engine.

**Terrain:** extend `TerrainId` and add a `terrains` entry with its palette, buildability, and blend weight. Ground layers blend in registry order, with grass providing the remaining base weight. `landscape` supplies elevation, moisture, temperature, and mountain fields; visual mesh jitter uses independent seeds.

**Scenery:** extend `SceneryId`, add a probability rule to `scenery`, and register its geometry in `sceneryModels`. World generation, occupancy, and depth sorting use the shared scenery interface.

Keep `WORLD_SEED` stable for existing saves. When changing generation or footprints incompatibly, version `SAVE_KEY` in the game component as well.

## Verify

```bash
npm test
npm run check
npm run build
```

Tests cover deterministic generation, continuous landscape fields, biome coverage, starting settlements, every building footprint, invalid placement, save restoration, and isometric picking.
