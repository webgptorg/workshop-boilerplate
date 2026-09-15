import type { BuildingModel } from "./models";
export type BuildingId =
  | "town-center"
  | "house"
  | "farm"
  | "barracks"
  | "market"
  | "workshop"
  | "blacksmith"
  | "stable"
  | "watchtower";
export interface BuildingDefinition {
  id: BuildingId;
  name: string;
  size: number;
  model: BuildingModel;
  roof: string;
  height: number;
}
/** New content is registered here; placement and the dock consume the registry. */
export const buildings: readonly BuildingDefinition[] = [
  {
    id: "town-center",
    name: "Town center",
    size: 2,
    model: "hall",
    roof: "#ad664d",
    height: 30,
  },
  {
    id: "house",
    name: "House",
    size: 1,
    model: "cottage",
    roof: "#b77753",
    height: 20,
  },
  {
    id: "farm",
    name: "Farm",
    size: 2,
    model: "farm",
    roof: "#aa7951",
    height: 17,
  },
  {
    id: "barracks",
    name: "Barracks",
    size: 2,
    model: "fort",
    roof: "#777e79",
    height: 28,
  },
  {
    id: "market",
    name: "Market",
    size: 2,
    model: "market",
    roof: "#b97656",
    height: 20,
  },
  {
    id: "workshop",
    name: "Workshop",
    size: 1,
    model: "workshop",
    roof: "#a97850",
    height: 23,
  },
  {
    id: "blacksmith",
    name: "Blacksmith",
    size: 1,
    model: "forge",
    roof: "#657776",
    height: 22,
  },
  {
    id: "stable",
    name: "Stable",
    size: 2,
    model: "stable",
    roof: "#97784d",
    height: 20,
  },
  {
    id: "watchtower",
    name: "Watchtower",
    size: 1,
    model: "tower",
    roof: "#ac6a4d",
    height: 47,
  },
];
export const buildingById = (id: BuildingId) =>
  buildings.find((b) => b.id === id)!;
export interface PlacedBuilding {
  id: string;
  type: BuildingId;
  x: number;
  y: number;
  owner: "player" | "ai";
}
export const initialBuildings: readonly PlacedBuilding[] = [
  { id: "home", type: "town-center", x: -1, y: -1, owner: "player" },
  { id: "rival-hall", type: "town-center", x: -18, y: -16, owner: "ai" },
  { id: "rival-house", type: "house", x: -15, y: -15, owner: "ai" },
  { id: "rival-farm", type: "farm", x: -18, y: -12, owner: "ai" },
  { id: "rival-tower", type: "watchtower", x: -14, y: -18, owner: "ai" },
];
