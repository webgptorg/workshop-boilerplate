# Agent guidelines

This repository is Voxel Garden, a full-screen, first-person voxel sandbox built with Next.js, TypeScript, and Babylon.js from a Promptbook starter. Keep it modular and understandable enough to fork or copy.

## Product direction

- Read [the original game brief](prompts/0000-game.md) for the design intent and [README.md](README.md) for the current implementation and controls.
- Keep the game full-screen with a crosshair and a minimal material dock. Do not add visible branding, control panels, instructions, or unrelated HUD elements unless requested. Preserve accessible labels, keyboard navigation, and loading/error feedback.
- The current scope is single-player creative building with unlimited materials and simple creature AI. Resources, combat, multiplayer, and turns need an explicit feature request.
- Prompts in `prompts/` record requested work; verify the implementation before describing a feature as complete.

## Architecture

- Keep the authoritative voxel grid, edits, persistence, and chunk invalidation in `lib/game/world.ts`. Physics and editing must use world data rather than rendered meshes.
- Keep seeded terrain generation deterministic, including negative coordinates and features crossing chunk boundaries. Put biome and terrain feature content in `lib/game/terrain/`.
- Define blocks in `lib/game/blocks.ts`. Preserve saved numeric block IDs; plan save compatibility when changing the registry, seed, generator, or save format.
- Keep Babylon rendering in `lib/game/rendering/`, character physics in `lib/game/physics.ts`, and gameplay input in `lib/game/input.ts`.
- Use the typed state machine in `lib/game/state-machine.ts` for creature transitions and the content interfaces in `lib/game/agents.ts` for creature models and behavior.
- Compose simulation systems through `GameSystem` in `lib/game/game.ts`. Dispose listeners, observers, meshes, materials, and engine resources when the client unmounts or retries.
- Keep game configuration in `lib/game/config.ts` and React game UI in `components/game/`. Load the browser-only runtime from the client boundary; do not access browser APIs during server rendering.

## Working rules

- Keep TypeScript strict and fix type errors instead of suppressing them.
- Prefer React Server Components. Add `"use client"` only where browser state or APIs are needed.
- Reuse `components/ui` and the CSS design tokens before adding another UI dependency.
- Keep Promptbook brand values in `app/globals.css`; do not invent or modify official logo assets.
- Put shared utilities in `lib` and reusable React code in `components`.
- Never commit secrets or real credentials.
- Keep line endings LF.
- Keep changes small and the Git history linear where practical.
- Update README controls and behavior when they change. Keep documentation aligned with code rather than unimplemented prompts.

## Before finishing

Run:

```bash
npm test
npm run check
npm run build
```

`check` runs ESLint and TypeScript. For simulation changes, add focused regression coverage in `tests/game.test.ts`. For input or rendering changes, also check the browser experience: movement, building/removal, dock keyboard navigation, chunk boundaries, and save/reload behavior as relevant. Report any failed checks or unverified behavior.

If you introduce a direct import from another Promptbook package, declare that package explicitly in `dependencies` instead of relying on a transitive dependency.


