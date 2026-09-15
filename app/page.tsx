"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TerrainKind = "ocean" | "grass" | "sand" | "rocks" | "gravel" | "forest";
type BuildingKind = "town" | "house" | "farm" | "barracks" | "market" | "workshop" | "blacksmith" | "stable" | "tower";
type NaturalKind = "tree" | "rock" | "bush";
const TILE_W = 76, TILE_H = 38;
const terrainPalette: Record<TerrainKind, string> = { ocean: "#397d91", grass: "#759b57", sand: "#cbb16b", rocks: "#829096", gravel: "#a3957e", forest: "#4d8055" };
const buildings: { kind: BuildingKind; label: string }[] = [
  { kind: "town", label: "Town Center" }, { kind: "house", label: "House" }, { kind: "farm", label: "Farm" }, { kind: "barracks", label: "Barracks" },
  { kind: "market", label: "Market" }, { kind: "workshop", label: "Workshop" }, { kind: "blacksmith", label: "Blacksmith" }, { kind: "stable", label: "Stable" }, { kind: "tower", label: "Watchtower" },
];
function hash(x: number, y: number) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
function noise(x: number, y: number) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, fade = (v: number) => v * v * (3 - 2 * v); const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1), u = fade(fx), v = fade(fy); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function terrainAt(x: number, y: number): TerrainKind { const broad = noise(x / 10, y / 10) * .62 + noise(x / 4, y / 4) * .28; if (broad < .27 || (Math.abs(Math.sin(x * .72 + y * .21)) < .045 && broad < .52)) return "ocean"; const detail = noise(x / 2.2 + 10, y / 2.2 - 7); if (broad < .35) return "sand"; if (detail > .79) return "rocks"; if (detail < .22 && broad > .42) return "forest"; if (detail > .57) return "gravel"; return "grass"; }
function naturalAt(x: number, y: number, terrain: TerrainKind): NaturalKind | undefined { if (terrain === "ocean" || hash(x + 4, y - 9) < .73) return undefined; const n = hash(x * 2 - 3, y * 2 + 5); return terrain === "forest" || n < .56 ? "tree" : n < .78 ? "bush" : "rock"; }

function BuildingArt({ kind, scale = 1 }: { kind: BuildingKind; scale?: number }) {
  const roof = kind === "town" ? "#d9a64a" : kind === "tower" ? "#bf7150" : kind === "farm" ? "#d6b05f" : "#b75e4e";
  const wall = kind === "town" ? "#ead09a" : kind === "blacksmith" ? "#817975" : "#d9c189";
  return <g transform={`scale(${scale})`} stroke="#352e2d" strokeWidth="1.7" strokeLinejoin="round">
    {kind === "farm" ? <><path d="M-22 9h44v9h-44z" fill="#a77d43"/><path d="M-18 5h36v5h-36z" fill="#e3c873"/><path d="M-15 0h30v6h-30z" fill="#89a656"/><path d="M-9 0v-8M0 0v-8M9 0v-8" stroke="#d7b75e"/></> : kind === "tower" ? <><path d="M-11 20l3-39h16l3 39z" fill="#b9b4a0"/><path d="M-15-19h26l-5-8h-16z" fill={roof}/><path d="M-5-9h5v8h-5zM4-9h5v8h-5z" fill="#4a5960"/></> : <><path d="M-20 20V-1h40v21z" fill={wall}/><path d="M-25 1L0-17 25 1z" fill={roof}/><path d="M-5 20V8h10v12z" fill="#6c4d3c"/><path d="M-16 5h7v7h-7zM9 5h7v7h-7z" fill="#607a79"/>{kind === "town" && <path d="M0-17v-12M0-29l8 4" stroke="#e3c36d"/>}{kind === "market" && <path d="M-20-1h40" stroke="#f3df9d"/>}{kind === "stable" && <path d="M-18-4h36" stroke="#70523e"/>}</>}
  </g>;
}
function NaturalArt({ kind }: { kind: NaturalKind }) { return <g stroke="#30473d" strokeWidth="1.5" strokeLinejoin="round">{kind === "tree" ? <><path d="M-3 15h6V0h-6z" fill="#76553c"/><path d="M0-21L-13 2h8L-12 9H12L6 2h7z" fill="#42734c"/></> : kind === "bush" ? <path d="M-16 10q0-14 8-9q4-14 10 0q8-7 14 9z" fill="#477b4f"/> : <path d="M-15 10l7-15 10 6 7-9 9 18z" fill="#778487"/>}</g>; }

function Game() {
  const [pan, setPan] = useState({ x: 0, y: 0 }), [selected, setSelected] = useState<BuildingKind>("house");
  const [built, setBuilt] = useState<Record<string, BuildingKind>>({ "0,0": "town" }), [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const cells = useMemo(() => { const result: { x: number; y: number; terrain: TerrainKind; key: string }[] = [], centerX = Math.round(-pan.x / TILE_W), centerY = Math.round(-pan.y / TILE_H); for (let y = centerY - 18; y <= centerY + 18; y++) for (let x = centerX - 24; x <= centerX + 24; x++) result.push({ x, y, terrain: terrainAt(x, y), key: `${x},${y}` }); return result; }, [pan.x, pan.y]);
  const move = useCallback((dx: number, dy: number) => setPan((p) => ({ x: p.x + dx, y: p.y + dy })), []);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { const d = 32; if (e.key === "ArrowLeft") move(d, 0); if (e.key === "ArrowRight") move(-d, 0); if (e.key === "ArrowUp") move(0, d); if (e.key === "ArrowDown") move(0, -d); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [move]);
  return <main className="game" onPointerDown={(e) => { if (!(e.target as Element).closest("button")) { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }; } }} onPointerMove={(e) => { if (dragging) setPan({ x: drag.current.panX + e.clientX - drag.current.x, y: drag.current.panY + e.clientY - drag.current.y }); }} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
    <svg className={`world ${dragging ? "is-dragging" : ""}`} viewBox="0 0 1360 820" preserveAspectRatio="xMidYMid slice" aria-label="Isometric world map">
      <defs><linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#4b91a1"/><stop offset="1" stopColor="#2d6e83"/></linearGradient><linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#91b568"/><stop offset="1" stopColor="#628d56"/></linearGradient></defs><rect width="1360" height="820" fill="#2b6d7e" />
      <g transform={`translate(${680 + pan.x} ${370 + pan.y})`}>{cells.map(({ x, y, terrain, key }) => { const px = (x - y) * TILE_W / 2, py = (x + y) * TILE_H / 2, b = built[key], natural = naturalAt(x, y, terrain); return <g key={key} transform={`translate(${px} ${py})`} onClick={(e) => { e.stopPropagation(); if (terrain !== "ocean" && !b && !natural) setBuilt((old) => ({ ...old, [key]: selected })); }} className={terrain === "ocean" ? "water-cell" : "land-cell"}><path d={`M0 ${-TILE_H / 2}L${TILE_W / 2} 0L0 ${TILE_H / 2}L${-TILE_W / 2} 0Z`} fill={terrain === "ocean" ? "url(#ocean)" : terrain === "grass" ? "url(#grass)" : terrainPalette[terrain]} stroke="rgba(38,58,54,.12)" strokeWidth="1"/>{terrain === "forest" && <path d="M-25 0q8-12 16 0q8-12 16 0q8-12 16 0" fill="none" stroke="#396d4b" strokeWidth="3" opacity=".65"/>}{terrain === "rocks" && <path d="M-17 8l7-13 8 9 8-13 10 17z" fill="#65787a" opacity=".8"/>}{terrain === "gravel" && <path d="M-22 5l5-3m7 9l4-3m10-3l6-3m-1 10l5-3" stroke="#746e66" opacity=".7"/>}{terrain === "sand" && <path d="M-24 5q12-7 24 0t24 0" fill="none" stroke="#e0ca8b" opacity=".6"/>}{natural && !b && <g transform="translate(0 -12)"><NaturalArt kind={natural} /></g>}{b && <g transform="translate(0 -17)"><BuildingArt kind={b} /></g>}</g>; })}</g>
    </svg><div className="dock" role="toolbar" aria-label="Buildings">{buildings.slice(1).map((item) => <button key={item.kind} className={`building-button ${selected === item.kind ? "selected" : ""}`} aria-label={item.label} onClick={() => setSelected(item.kind)}><svg viewBox="-32 -42 64 72" aria-hidden="true"><BuildingArt kind={item.kind} scale={.82}/></svg></button>)}</div>
  </main>;
}
export default function Home() { return <Game />; }
