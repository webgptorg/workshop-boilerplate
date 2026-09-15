"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildings,
  type BuildingDefinition,
  type BuildingId,
} from "@/lib/game/buildings";
import { World, type Camera, type Cell } from "@/lib/game/engine";
import { drawBuilding, project } from "@/lib/game/models";

const SAVE_KEY = "stillwater-world-v1";
function BuildingPreview({ building }: { building: BuildingDefinition }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = 88 * ratio;
    canvas.height = 76 * ratio;
    ctx.scale(ratio, ratio);
    const scale = building.size === 2 ? 0.57 : 0.82;
    ctx.translate(44, building.model === "tower" ? 65 : 57);
    ctx.scale(scale, scale);
    ctx.translate(0, -project(building.size / 2, building.size / 2)[1]);
    drawBuilding(ctx, building);
  }, [building]);
  return <canvas ref={ref} className="building-preview" aria-hidden="true" />;
}
export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef<BuildingId | null>(null);
  const invalidateRef = useRef<() => void>(() => {});
  const [selected, setSelected] = useState<BuildingId | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const select = (id: BuildingId | null) => {
    selectedRef.current = id;
    setSelected(id);
    invalidateRef.current();
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const world = new World((width, height) => {
      const surface = document.createElement("canvas");
      surface.width = width;
      surface.height = height;
      return surface;
    });
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) world.restore(JSON.parse(saved));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    let width = 0,
      height = 0,
      ratio = 1,
      frame = 0,
      dirty = true,
      lastTime = 0;
    const camera: Camera = { x: 0, y: 0 };
    let hover: Cell | null = null;
    let pointer: {
      id: number;
      x: number;
      y: number;
      startX: number;
      startY: number;
      dragged: boolean;
    } | null = null;
    const keys = new Set<string>();
    const resize = () => {
      const oldW = width,
        oldH = height;
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      camera.x += (width - oldW) / 2;
      camera.y += (height - oldH) * 0.46;
      dirty = true;
    };
    invalidateRef.current = () => {
      dirty = true;
    };
    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const speed = 420 * delta;
      if (keys.size) {
        if (keys.has("ArrowLeft")) camera.x += speed;
        if (keys.has("ArrowRight")) camera.x -= speed;
        if (keys.has("ArrowUp")) camera.y += speed;
        if (keys.has("ArrowDown")) camera.y -= speed;
        hover = null;
        dirty = true;
      }
      if (dirty) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        world.render(ctx, width, height, camera, selectedRef.current, hover);
        dirty = false;
      }
      frame = requestAnimationFrame(animate);
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || pointer) return;
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        dragged: false,
      };
      hover = world.pick(event.clientX, event.clientY, camera);
      dirty = true;
    };
    const move = (event: PointerEvent) => {
      if (pointer && pointer.id === event.pointerId) {
        if (
          Math.hypot(
            event.clientX - pointer.startX,
            event.clientY - pointer.startY,
          ) > 5
        )
          pointer.dragged = true;
        if (pointer.dragged) {
          camera.x += event.clientX - pointer.x;
          camera.y += event.clientY - pointer.y;
          canvas.style.cursor = "grabbing";
        }
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      }
      hover = pointer?.dragged
        ? null
        : world.pick(event.clientX, event.clientY, camera);
      dirty = true;
    };
    const up = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (!pointer.dragged && selectedRef.current) {
        const cell = world.pick(event.clientX, event.clientY, camera);
        const type = selectedRef.current;
        if (world.place(type, cell.x, cell.y)) {
          setAnnouncement(
            `${buildings.find((b) => b.id === type)?.name} built.`,
          );
          try {
            localStorage.setItem(
              SAVE_KEY,
              JSON.stringify(
                world.buildings.filter((b) => b.id.startsWith("built-")),
              ),
            );
          } catch {
            /* The current session remains playable without storage. */
          }
        } else setAnnouncement("Choose clear, level ground to build.");
      }
      pointer = null;
      canvas.style.cursor = selectedRef.current ? "crosshair" : "grab";
      dirty = true;
    };
    const cancel = () => {
      pointer = null;
      keys.clear();
      canvas.style.cursor = "grab";
      dirty = true;
    };
    const leave = () => {
      if (!pointer) {
        hover = null;
        dirty = true;
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        keys.add(event.key);
      }
      if (event.key === "Escape") {
        selectedRef.current = null;
        setSelected(null);
        dirty = true;
      }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < buildings.length && event.key.length === 1) {
        selectedRef.current = buildings[index].id;
        setSelected(buildings[index].id);
        dirty = true;
      }
    };
    const keyup = (event: KeyboardEvent) => keys.delete(event.key);
    resize();
    // Paint immediately: browsers may defer animation frames for an occluded window.
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    world.render(ctx, width, height, camera, selectedRef.current, hover);
    dirty = false;
    frame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", cancel);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", cancel);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      invalidateRef.current = () => {};
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", cancel);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <main className="game" aria-label="Stillwater city builder">
      <canvas
        ref={canvasRef}
        className={`world-map${selected ? " is-building" : ""}`}
        tabIndex={0}
        aria-label="Isometric world. Drag or use arrow keys to explore. Select a building and click clear ground to build. Escape cancels. Keys 1 to 9 select buildings."
      />
      <nav className="building-dock" aria-label="Buildings">
        {buildings.map((building, index) => (
          <button
            key={building.id}
            type="button"
            className={`dock-item${selected === building.id ? " selected" : ""}`}
            aria-label={`Build ${building.name}`}
            aria-pressed={selected === building.id}
            onClick={() =>
              select(selected === building.id ? null : building.id)
            }
          >
            <span className="dock-tooltip">
              {building.name}
              <kbd>{index + 1}</kbd>
            </span>
            <BuildingPreview building={building} />
            <span className="selection-dot" />
          </button>
        ))}
      </nav>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </main>
  );
}
