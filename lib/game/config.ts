export const WORLD_CONFIG = {
  seed: 73621,
  chunkSize: 16,
  seaLevel: 0,
  minY: -24,
  maxY: 72,
  renderDistance: 10,
  unloadDistance: 13,
  reach: 7,
  storageKey: "voxel-garden:world:v2",
} as const;

export const PLAYER_CONFIG = {
  radius: 0.28,
  height: 1.75,
  eyeHeight: 1.62,
  speed: 5.2,
  sprintSpeed: 8.2,
  gravity: 25,
  jumpSpeed: 8.6,
  stepHeight: 1,
  mouseSensitivity: 0.0021,
  keyboardLookSpeed: 1.6,
} as const;
