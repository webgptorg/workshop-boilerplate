export type MaterialId = "grass" | "sand" | "rocks" | "gravel" | "wood" | "water";
export type MaterialDefinition = { id: MaterialId; label: string; color: string; emissive: string };
export const MATERIALS: MaterialDefinition[] = [
  { id: "grass", label: "Grass", color: "#6d9b52", emissive: "#496b35" }, { id: "sand", label: "Sand", color: "#d8bd78", emissive: "#a78d52" },
  { id: "rocks", label: "Rocks", color: "#788087", emissive: "#4d565b" }, { id: "gravel", label: "Gravel", color: "#a3a39b", emissive: "#707068" },
  { id: "wood", label: "Wood", color: "#9a613b", emissive: "#70432a" }, { id: "water", label: "Water", color: "#559eb1", emissive: "#347080" },
];
export const materialFor = (id: MaterialId) => MATERIALS.find((material) => material.id === id) ?? MATERIALS[0];
export function terrainHeight(x: number, z: number) { return Math.max(0, Math.floor(2 + Math.sin(x * 0.28) * 1.3 + Math.cos(z * 0.24) * 1.1 + Math.sin((x + z) * 0.16) * 0.7)); }
