"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MaterialId = "grass" | "sand" | "rock" | "gravel" | "wood" | "water";
type Material = { id: MaterialId; label: string; color: string; accent: string };
type Block = { x: number; y: number; z: number; material: MaterialId };

const MATERIALS: readonly Material[] = [
  { id: "grass", label: "Grass", color: "#749b67", accent: "#9cba79" }, { id: "sand", label: "Sand", color: "#d5b67a", accent: "#efd59a" }, { id: "rock", label: "Rock", color: "#727b82", accent: "#aab1b2" }, { id: "gravel", label: "Gravel", color: "#9a9488", accent: "#c4bcae" }, { id: "wood", label: "Wood", color: "#9b6844", accent: "#c28b5d" }, { id: "water", label: "Water", color: "#4e9aa1", accent: "#83c8c4" },
];
const TERRAIN: readonly Block[] = [
  ...Array.from({ length: 13 }, (_, x) => Array.from({ length: 9 }, (_, z) => ({ x: x - 6, y: 0, z: z + 1, material: (x > 8 && z < 5 ? "sand" : "grass") as MaterialId }))).flat(),
  ...Array.from({ length: 8 }, (_, x) => ({ x: x - 6, y: 1, z: 2, material: "rock" as MaterialId })),
  ...Array.from({ length: 5 }, (_, z) => ({ x: 3, y: 1, z: z + 3, material: "wood" as MaterialId })), ...Array.from({ length: 4 }, (_, z) => ({ x: 4, y: 1, z: z + 3, material: "wood" as MaterialId })), ...Array.from({ length: 4 }, (_, z) => ({ x: 3, y: 2, z: z + 3, material: "wood" as MaterialId })),
];
const materialById = Object.fromEntries(MATERIALS.map((material) => [material.id, material])) as Record<MaterialId, Material>;

function Cube({ block }: { block: Block }) { const material = materialById[block.material]; return <div className="voxel" style={{ "--x": block.x, "--y": block.y, "--z": block.z, "--block": material.color, "--accent": material.accent } as React.CSSProperties} aria-label={material.label}><i className="face top" /><i className="face front" /><i className="face side" /><i className="face back" /><i className="face left" /><i className="face bottom" /></div>; }

export function VoxelWorld() {
  const [selected, setSelected] = useState<MaterialId>("grass"); const [blocks, setBlocks] = useState<readonly Block[]>(TERRAIN); const [rotation, setRotation] = useState({ x: -9, y: -18 }); const drag = useRef({ active: false, x: 0, y: 0 });
  const position = useRef({ x: 0, z: 0 }); const [worldPosition, setWorldPosition] = useState({ x: 0, z: 0 }); const keys = useRef(new Set<string>());
  const addBlock = useCallback(() => setBlocks((current) => [...current, { x: 0, y: 1, z: 1, material: selected }]), [selected]);
  const removeBlock = useCallback(() => setBlocks((current) => current.length > TERRAIN.length ? current.slice(0, -1) : current), []);
  useEffect(() => { const move = (event: MouseEvent) => { if (!drag.current.active) return; setRotation((value) => ({ x: Math.max(-32, Math.min(16, value.x + (event.clientY - drag.current.y) * .12)), y: value.y + (event.clientX - drag.current.x) * .16 })); drag.current = { active: true, x: event.clientX, y: event.clientY }; }; const up = () => { drag.current.active = false; }; window.addEventListener("mousemove", move); window.addEventListener("mouseup", up); return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); }; }, []);
  useEffect(() => { const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase()); const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase()); window.addEventListener("keydown", down); window.addEventListener("keyup", up); let frame = 0; const tick = () => { const speed = .08; const next = { ...position.current }; if (keys.current.has("w")) next.z -= speed; if (keys.current.has("s")) next.z += speed; if (keys.current.has("a")) next.x -= speed; if (keys.current.has("d")) next.x += speed; if (next.x !== position.current.x || next.z !== position.current.z) { position.current = next; setWorldPosition(next); } frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); cancelAnimationFrame(frame); }; }, []);
  const style = useMemo(() => ({ "--look-x": `${rotation.x}deg`, "--look-y": `${rotation.y}deg`, "--move-x": `${worldPosition.x * -42}px`, "--move-z": `${worldPosition.z * -42}px` }) as React.CSSProperties, [rotation, worldPosition]);
  return <main className="game" style={style} onContextMenu={(event) => event.preventDefault()} onMouseDown={(event) => { if (event.button === 0) addBlock(); if (event.button === 2) removeBlock(); if (event.target === event.currentTarget) drag.current = { active: true, x: event.clientX, y: event.clientY }; }}><div className="sky" /><div className="world"><div className="terrain">{blocks.map((block, index) => <Cube block={block} key={`${block.x}-${block.y}-${block.z}-${index}`} />)}</div></div><div className="aim" aria-hidden="true" /><div className="tray" role="toolbar" aria-label="Building materials">{MATERIALS.map((material) => <button key={material.id} className={selected === material.id ? "material active" : "material"} onClick={(event) => { event.stopPropagation(); setSelected(material.id); }} aria-label={material.label} title={material.label} style={{ "--swatch": material.color, "--swatch-accent": material.accent } as React.CSSProperties}><span /></button>)}</div></main>;
}
