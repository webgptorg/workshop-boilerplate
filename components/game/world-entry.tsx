"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { loadWorld } from "@/lib/game/saves";
import { VoxelGame } from "./voxel-game";
import { buttonClassName } from "@/components/ui/button";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function WorldEntry({ worldId }: { worldId: string }) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const { world, error } = useMemo(() => {
    if (!hydrated) return { world: null, error: null };
    try {
      const world = loadWorld(localStorage, worldId);
      return { world, error: world ? null : "This world does not exist in this browser. Choose or create a world to play." };
    } catch {
      return { world: null, error: "This world could not be loaded. Its save may be damaged or browser storage may be unavailable." };
    }
  }, [hydrated, worldId]);

  if (world) return <VoxelGame savedWorld={world} />;
  return <main className="world-welcome">
    <h1>Voxel Garden</h1>
    <p role={error ? "alert" : "status"}>{error ?? "Loading your world…"}</p>
    <Link className={buttonClassName()} href="/">Back to worlds</Link>
  </main>;
}
