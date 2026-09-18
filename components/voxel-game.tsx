"use client";
import { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import { MATERIALS, materialFor, type MaterialId, terrainHeight } from "@/lib/voxel-world";

export function VoxelGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null); const [selected, setSelected] = useState<MaterialId>("grass");
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); const scene = new BABYLON.Scene(engine); scene.clearColor = new BABYLON.Color4(.48, .75, .8, 1);
    const camera = new BABYLON.UniversalCamera("explorer", new BABYLON.Vector3(0, 6, -10), scene); camera.attachControl(canvas, true); camera.speed = .28; camera.angularSensibility = 3500; camera.minZ = .1; camera.ellipsoid = new BABYLON.Vector3(.32, .85, .32); scene.activeCamera = camera;
    const mats = new Map<MaterialId, BABYLON.StandardMaterial>(); MATERIALS.forEach((d) => { const m = new BABYLON.StandardMaterial(d.id, scene); m.diffuseColor = BABYLON.Color3.FromHexString(d.color); m.emissiveColor = BABYLON.Color3.FromHexString(d.emissive); m.specularColor = BABYLON.Color3.Black(); mats.set(d.id, m); });
    const blocks = new Map<string, BABYLON.Mesh>(); const key = (x: number, y: number, z: number) => `${x}:${y}:${z}`;
    const addBlock = (x: number, y: number, z: number, id: MaterialId) => { const mesh = BABYLON.MeshBuilder.CreateBox(`block-${key(x, y, z)}`, { size: 1 }, scene); mesh.position.set(x, y + .5, z); mesh.material = mats.get(id)!; mesh.metadata = { voxel: { x, y, z } }; blocks.set(key(x, y, z), mesh); };
    for (let x = -18; x <= 18; x += 1) for (let z = -18; z <= 18; z += 1) { const h = terrainHeight(x, z); for (let y = 0; y <= h; y += 1) addBlock(x, y, z, y === h ? (h < 2 ? "sand" : "grass") : "rocks"); if ((x * 13 + z * 7) % 31 === 0 && h > 2) for (let y = h + 1; y < h + 4; y += 1) addBlock(x, y, z, "wood"); }
    const remove = (mesh: BABYLON.Mesh) => { const v = mesh.metadata.voxel; mesh.dispose(); blocks.delete(key(v.x, v.y, v.z)); };
    const pointer = (event: PointerEvent) => { if (document.pointerLockElement !== canvas) { canvas.requestPointerLock(); return; } const hit = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2); if (!hit?.hit || !(hit.pickedMesh instanceof BABYLON.Mesh) || !hit.pickedMesh.metadata?.voxel) return; const v = hit.pickedMesh.metadata.voxel as { x: number; y: number; z: number }; if (event.button === 2) { if (v.y > 0) remove(hit.pickedMesh); return; } if (event.button === 0 && hit.getNormal()) { const n = hit.getNormal()!; const x = v.x + Math.round(n.x), y = v.y + Math.round(n.y), z = v.z + Math.round(n.z); if (!blocks.has(key(x, y, z)) && y >= 0) addBlock(x, y, z, selected); } };
    canvas.addEventListener("pointerdown", pointer); canvas.addEventListener("contextmenu", (e) => e.preventDefault()); engine.runRenderLoop(() => scene.render()); const resize = () => engine.resize(); window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); canvas.removeEventListener("pointerdown", pointer); engine.dispose(); };
  }, [selected]);
  return <main className="game-shell"><canvas ref={canvasRef} className="game-canvas" /><div className="crosshair" aria-hidden="true" /><nav className="material-tray" aria-label="Building materials">{MATERIALS.map((m) => <button key={m.id} className={`material-button${selected === m.id ? " selected" : ""}`} aria-label={m.label} onClick={() => setSelected(m.id)}><span className="material-swatch" style={{ background: materialFor(m.id).color }} /><span className="material-label">{m.label}</span></button>)}</nav></main>;
}
