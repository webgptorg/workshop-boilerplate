"use client";

import { useEffect, useRef, useState } from "react";
import type { VoxelGame as Game } from "@/lib/game/game";
import { MaterialDock } from "./material-dock";

export function VoxelGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [selected, setSelected] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    import("@/lib/game/game").then(({ VoxelGame: GameRuntime }) => {
      if (cancelled) return;
      try {
        gameRef.current = new GameRuntime(canvas, {
          onReady: () => { if (!cancelled) setReady(true); },
          onSelection: (index) => { if (!cancelled) setSelected(index); },
          onError: (message) => { if (!cancelled) setError(message); },
        });
      } catch (cause) {
        console.error("Unable to start the voxel world", cause);
        if (!cancelled) setError("This world needs a browser with WebGL enabled.");
      }
    }).catch((cause: unknown) => {
      console.error("Unable to load the voxel world", cause);
      if (!cancelled) setError("The world could not load. Please try again.");
    });
    return () => { cancelled = true; gameRef.current?.dispose(); gameRef.current = null; };
  }, [attempt]);

  return (
    <main className="voxel-game" data-ready={ready} aria-label="Voxel sandbox">
      <canvas
        ref={canvasRef}
        className="world-canvas"
        tabIndex={0}
        aria-label="First-person voxel world"
        aria-describedby="game-instructions"
      />
      <p id="game-instructions" className="sr-only">
        Click the world to capture the mouse. WASD to move, mouse or arrow keys to look,
        space to jump. Left click places a block, right click removes one. Press Escape
        to release the mouse. Choose a material below, with keys 1 to 6, or the scroll wheel.
      </p>
      {!error && <div className="crosshair" aria-hidden="true"><span /><span /></div>}
      {!ready && !error && <div className="world-loading" role="status" aria-label="Generating world"><span /><span /><span /></div>}
      {error && (
        <div className="world-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => { setError(null); setReady(false); setAttempt((value) => value + 1); }}>Try again</button>
        </div>
      )}
      <MaterialDock selected={selected} onSelect={(index, focusCanvas) => {
        gameRef.current?.select(index);
        setSelected(index);
        if (focusCanvas) canvasRef.current?.focus({ preventScroll: true });
      }} />
    </main>
  );
}
