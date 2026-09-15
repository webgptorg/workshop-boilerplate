"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TerrainType = "ocean" | "grass" | "sand" | "rocks" | "gravel";
type Building = { id: string; name: string; shortName: string; color: string };
type PlacedBuilding = Building & { x: number; y: number };

const TILE_W = 92;
const TILE_H = 46;
const BUILDINGS: Building[] = [
  { id: "house", name: "House", shortName: "⌂", color: "#c47b4b" },
  { id: "farm", name: "Farm", shortName: "⌁", color: "#d7aa53" },
  { id: "barracks", name: "Barracks", shortName: "♜", color: "#896f66" },
  { id: "market", name: "Market", shortName: "✣", color: "#c56a57" },
  { id: "workshop", name: "Workshop", shortName: "⚒", color: "#66858a" },
  { id: "blacksmith", name: "Blacksmith", shortName: "♨", color: "#5f6872" },
  { id: "stable", name: "Stable", shortName: "♞", color: "#8b664c" },
  { id: "watchtower", name: "Watchtower", shortName: "♜", color: "#73716d" },
];
const STARTING_BUILDING: PlacedBuilding = { id: "town-center", name: "Town Center", shortName: "✦", color: "#b9554a", x: 0, y: 0 };

function noise(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
function smoothNoise(x: number, y: number) {
  const ix = Math.floor(x); const iy = Math.floor(y); const fx = x - ix; const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx); const uy = fy * fy * (3 - 2 * fy);
  return noise(ix, iy) * (1 - ux) * (1 - uy) + noise(ix + 1, iy) * ux * (1 - uy) + noise(ix, iy + 1) * (1 - ux) * uy + noise(ix + 1, iy + 1) * ux * uy;
}
function terrainAt(x: number, y: number): TerrainType {
  const broad = smoothNoise(x / 10, y / 10) * 0.7 + smoothNoise(x / 4, y / 4) * 0.3;
  const settlementIsland = 0.62 * Math.exp(-(x * x + y * y) / 20);
  const island = broad + settlementIsland + Math.sin(x * 0.11 + y * 0.17) * 0.035;
  if (island < 0.43) return "ocean";
  const dry = smoothNoise(x / 6 + 13, y / 6 - 8);
  if (dry > 0.72 && island > 0.62) return "sand";
  if (dry < 0.2 && island > 0.54) return "rocks";
  if (smoothNoise(x / 2.6 - 40, y / 2.6 + 11) > 0.82) return "gravel";
  return "grass";
}
const TERRAIN_COLORS: Record<TerrainType, [string, string]> = { ocean: ["#739fa0", "#4c7f84"], grass: ["#aabd78", "#718d5e"], sand: ["#d9c083", "#b79b62"], rocks: ["#9b9a87", "#76766f"], gravel: ["#b3aa96", "#8e8778"] };
function hexToRgb(hex: string) { const value = hex.replace("#", ""); return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]; }
function mixColors(colors: string[]) { const rgb = colors.map(hexToRgb); const result = rgb.reduce((sum, color) => sum.map((value, index) => value + color[index]), [0, 0, 0]).map((value) => Math.round(value / rgb.length)); return `rgb(${result.join(",")})`; }

export function GameBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0, startX: 0, startY: 0 });
  const [selected, setSelected] = useState<Building | null>(BUILDINGS[0]);
  const [placed, setPlaced] = useState<PlacedBuilding[]>([STARTING_BUILDING]);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return;
    const rect = canvas.getBoundingClientRect(); const pixelRatio = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * pixelRatio || canvas.height !== rect.height * pixelRatio) { canvas.width = rect.width * pixelRatio; canvas.height = rect.height * pixelRatio; }
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); context.clearRect(0, 0, rect.width, rect.height); context.fillStyle = "#5d888a"; context.fillRect(0, 0, rect.width, rect.height);
    const camera = cameraRef.current; const centerX = rect.width / 2 + camera.x; const centerY = rect.height / 2 + camera.y; const radius = Math.ceil(Math.max(rect.width / TILE_W, rect.height / TILE_H)) + 4;
    const project = (x: number, y: number) => ({ x: centerX + (x - y) * TILE_W / 2, y: centerY + (x + y) * TILE_H / 2 });
    for (let y = -radius; y <= radius; y += 1) for (let x = -radius; x <= radius; x += 1) {
      const point = project(x, y); if (point.x < -TILE_W || point.x > rect.width + TILE_W || point.y < -TILE_H * 2 || point.y > rect.height + TILE_H * 2) continue;
      const corners = [project(x, y - 1), project(x + 1, y), project(x, y + 1), project(x - 1, y)]; const cornerTerrain = [terrainAt(x, y - 1), terrainAt(x + 1, y), terrainAt(x, y + 1), terrainAt(x - 1, y)]; const terrain = terrainAt(x, y);
      const gradient = context.createLinearGradient(point.x - TILE_W / 2, point.y - TILE_H, point.x + TILE_W / 2, point.y + TILE_H); gradient.addColorStop(0, mixColors(cornerTerrain.slice(0, 2).map((kind) => TERRAIN_COLORS[kind][0]))); gradient.addColorStop(1, mixColors(cornerTerrain.slice(2).map((kind) => TERRAIN_COLORS[kind][1])));
      context.beginPath(); context.moveTo(corners[0].x, corners[0].y); corners.slice(1).forEach((corner) => context.lineTo(corner.x, corner.y)); context.closePath(); context.fillStyle = gradient; context.fill(); context.strokeStyle = terrain === "ocean" ? "rgba(194,226,218,.12)" : "rgba(56,78,65,.12)"; context.lineWidth = .7; context.stroke();
      if (terrain !== "ocean") { context.fillStyle = terrain === "rocks" ? "rgba(70,70,66,.11)" : "rgba(255,245,202,.08)"; context.beginPath(); context.ellipse(point.x + (noise(x, y) - .5) * 24, point.y + (noise(y, x) - .5) * 10, 12 + noise(x + 3, y) * 9, 4, noise(x, y) * 2, 0, Math.PI * 2); context.fill(); } else if (noise(x * 2, y * 2) > .63) { context.strokeStyle = "rgba(213,240,225,.18)"; context.beginPath(); context.arc(point.x - 10, point.y, 12, Math.PI * .12, Math.PI * .88); context.stroke(); }
    }
    placed.forEach((building) => { const point = project(building.x, building.y); if (terrainAt(building.x, building.y) === "ocean") return; const scale = building.id === "town-center" ? 1.22 : .92; context.save(); context.translate(point.x, point.y - 12 * scale); context.scale(scale, scale); context.fillStyle = "rgba(40,52,43,.26)"; context.beginPath(); context.ellipse(0, 18, 31, 8, 0, 0, Math.PI * 2); context.fill(); context.fillStyle = building.color; context.beginPath(); context.moveTo(-22, 5); context.lineTo(-22, -15); context.lineTo(0, -26); context.lineTo(22, -15); context.lineTo(22, 5); context.closePath(); context.fill(); context.fillStyle = building.id === "farm" ? "#a37a3c" : "#73463d"; context.beginPath(); context.moveTo(-25, -14); context.lineTo(0, -34); context.lineTo(25, -14); context.lineTo(0, -3); context.closePath(); context.fill(); context.fillStyle = "#f1d79a"; context.fillRect(-4, -6, 8, 11); context.fillStyle = "rgba(255,236,166,.8)"; context.fillRect(-14, -11, 7, 6); context.fillRect(7, -11, 7, 6); if (building.id === "town-center") { context.fillStyle = "#f3d887"; context.fillRect(-2, -45, 4, 15); context.beginPath(); context.moveTo(2, -45); context.lineTo(14, -40); context.lineTo(2, -36); context.fill(); } context.restore(); });
    if (hoveredCell && selected && terrainAt(hoveredCell.x, hoveredCell.y) !== "ocean") { const point = project(hoveredCell.x, hoveredCell.y); context.fillStyle = "rgba(255,235,157,.24)"; context.beginPath(); context.moveTo(point.x, point.y - TILE_H); context.lineTo(point.x + TILE_W / 2, point.y); context.lineTo(point.x, point.y + TILE_H); context.lineTo(point.x - TILE_W / 2, point.y); context.closePath(); context.fill(); }
  }, [hoveredCell, placed, selected]);
  useEffect(() => { const render = () => { draw(); frameRef.current = requestAnimationFrame(render); }; frameRef.current = requestAnimationFrame(render); return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }; }, [draw]);
  const cellFromPointer = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const camera = cameraRef.current; const px = event.clientX - rect.left - rect.width / 2 - camera.x; const py = event.clientY - rect.top - rect.height / 2 - camera.y; return { x: Math.round(px / TILE_W + py / TILE_H), y: Math.round(py / TILE_H - px / TILE_W) }; };
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => { dragRef.current = { active: true, moved: false, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => { setHoveredCell(cellFromPointer(event)); if (!dragRef.current.active) return; if (Math.hypot(event.clientX - dragRef.current.startX, event.clientY - dragRef.current.startY) > 5) dragRef.current.moved = true; cameraRef.current.x += event.clientX - dragRef.current.x; cameraRef.current.y += event.clientY - dragRef.current.y; dragRef.current.x = event.clientX; dragRef.current.y = event.clientY; };
  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => { if (!dragRef.current.moved && selected) { const cell = cellFromPointer(event); if (terrainAt(cell.x, cell.y) !== "ocean" && !placed.some((building) => building.x === cell.x && building.y === cell.y)) setPlaced((current) => [...current, { ...selected, x: cell.x, y: cell.y }]); } dragRef.current.active = false; };
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { const step = 42; if (event.key === "ArrowUp") cameraRef.current.y += step; if (event.key === "ArrowDown") cameraRef.current.y -= step; if (event.key === "ArrowLeft") cameraRef.current.x += step; if (event.key === "ArrowRight") cameraRef.current.x -= step; }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  return <main className="game-shell"><canvas ref={canvasRef} className="game-canvas" aria-label="Isometric medieval map" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={() => setHoveredCell(null)} /><div className="build-tray" aria-label="Buildings"><div className="tray-inner">{BUILDINGS.map((building) => <button key={building.id} className={`building-button ${selected?.id === building.id ? "is-selected" : ""}`} onClick={() => setSelected(building)} aria-label={`Build ${building.name}`}><span className="building-glyph" style={{ "--building-color": building.color } as React.CSSProperties}>{building.shortName}</span><span className="building-name">{building.name}</span></button>)}</div></div></main>;
}
