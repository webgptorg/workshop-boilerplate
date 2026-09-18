/** Material-specific analytic textures. Coordinates are in block units. Each
 * recipe has broad structure, medium features and filtered fine detail; colors
 * are multipliers of the existing art palette, not replacement image assets.
 * Shared noise/cellular functions are supplied by SURFACE_TEXTURE_GLSL.
 */
export const MATERIAL_PATTERNS_GLSL = `
  float textureWave(float phase) {
    float footprint = max(abs(dFdx(phase)), abs(dFdy(phase)));
    return sin(phase) * (1.0 - smoothstep(1.0, 3.14, footprint));
  }
  vec3 grassPattern(vec3 p) {
    float meadow = layeredNoise(p * 0.22);
    float clumps = valueNoise(p * vec3(3.0, 1.5, 3.0));
    float blades = valueNoise(p * vec3(38.0, 4.0, 17.0));
    float thatch = valueNoise(p * vec3(14.0, 2.0, 42.0));
    return vec3(1.0) + meadow * vec3(0.46, 0.30, 0.16)
      + vec3(clumps * 0.22 + blades * 0.32 + thatch * 0.12);
  }
  vec3 sandPattern(vec3 p) {
    float dunes = layeredNoise(p * vec3(0.13, 0.24, 0.22));
    float warp = layeredNoise(p * 0.65);
    float ripples = textureWave(p.x * 12.0 + p.z * 5.0 + p.y * 2.5 + warp * 9.0);
    float grains = valueNoise(p * 95.0);
    return vec3(1.0) + dunes * vec3(0.20, 0.25, 0.30)
      + vec3(ripples * (0.045 + dunes * 0.04) + grains * 0.20 + valueNoise(p * 13.0) * 0.06);
  }
  vec3 rockPattern(vec3 p, vec3 n) {
    float mass = layeredNoise(p * 0.38);
    float strata = textureWave(p.y * 9.0 + layeredNoise(p * 0.8) * 6.0);
    vec3 stone = surfaceCells(p * 1.15 + vec3(mass * 0.35), n);
    float aa = max(fwidth(stone.y), 0.012);
    float cracks = 1.0 - smoothstep(0.014, 0.014 + aa, stone.y);
    float facets = stone.x;
    float weathering = layeredNoise(p * 5.0);
    float minerals = valueNoise(p * 48.0);
    return vec3(1.0) + mass * vec3(0.28, 0.31, 0.35)
      + vec3(strata * 0.065 + facets * 0.24 - cracks * 0.12 + weathering * 0.28 + minerals * 0.20);
  }
  vec3 gravelPattern(vec3 p, vec3 n) {
    // Closely packed pebbles: dark interstices, varied stone colors and chips.
    vec3 pebble = surfaceCells(p * 7.5, n);
    float gap = 1.0 - smoothstep(0.015, 0.10, pebble.y);
    float rounding = 1.0 - smoothstep(0.02, 0.42, pebble.z);
    float bed = layeredNoise(p * 0.45);
    return vec3(0.99) + pebble.x * vec3(0.31, 0.28, 0.23)
      + vec3(rounding * 0.07 - gap * 0.20 + bed * 0.15 + valueNoise(p * 65.0) * 0.12);
  }
  vec3 woodPattern(vec3 p, vec3 n) {
    float warp = layeredNoise(p * vec3(2.0, 0.32, 2.0));
    float grain = valueNoise(p * vec3(25.0, 1.2, 25.0) + vec3(warp * 2.0));
    float bark = valueNoise(p * vec3(7.0, 0.5, 7.0));
    float grooves = textureWave((p.x + p.z) * 39.0 + warp * 7.0);
    // Log ends get irregular growth rings instead of vertical bark.
    vec2 center = fract(p.xz) - 0.5;
    float rings = textureWave(length(center) * 95.0 + warp * 3.0);
    float end = smoothstep(0.65, 0.95, abs(n.y));
    float side = bark * 0.42 + grain * 0.28 + grooves * 0.055;
    return vec3(1.0) + mix(vec3(side), vec3(rings * 0.10 + grain * 0.12), end)
      + layeredNoise(p * 0.4) * vec3(0.20, 0.13, 0.08);
  }
  vec3 soilPattern(vec3 p, vec3 n) {
    float earth = layeredNoise(p * 0.65);
    float clods = surfaceTexture(p * 1.5, n);
    float pores = valueNoise(p * 58.0);
    return vec3(1.0) + earth * vec3(0.32, 0.24, 0.18)
      + vec3(clods * 0.42 + min(pores, 0.0) * 0.34);
  }
  vec3 leavesPattern(vec3 p, vec3 n) {
    vec3 leaf = surfaceCells(p * vec3(9.0, 13.0, 9.0), n);
    float canopy = layeredNoise(p * 0.9);
    float veins = textureWave((p.x + p.y + p.z) * 100.0 + leaf.x * 12.0);
    float seams = 1.0 - smoothstep(0.01, 0.10, leaf.y);
    return vec3(1.0) + canopy * vec3(0.25, 0.38, 0.18)
      + vec3(leaf.x * 0.26 - seams * 0.09 + veins * 0.025);
  }
  vec3 tuftPattern(vec3 p) {
    float fibers = valueNoise(p * vec3(110.0, 3.0, 110.0));
    float tips = valueNoise(p * vec3(8.0, 14.0, 8.0));
    return vec3(1.0) + vec3(fibers * 0.28) + tips * vec3(0.24, 0.12, 0.06);
  }
  vec3 flowerPattern(vec3 p) {
    float petals = textureWave((p.x + p.z) * 75.0 + valueNoise(p * 15.0) * 5.0);
    float pollen = valueNoise(p * 180.0);
    return vec3(1.0) + petals * vec3(0.025, 0.055, 0.09) + vec3(pollen * 0.15);
  }
  vec3 pinePattern(vec3 p) {
    float branches = layeredNoise(p * vec3(2.0, 4.0, 2.0));
    float needles = valueNoise(vec3(p.x + p.y * 0.6, p.y * 0.2, p.z - p.y * 0.6) * 48.0);
    return vec3(1.0) + branches * vec3(0.20, 0.36, 0.30) + vec3(needles * 0.34);
  }
  vec3 waterPattern(vec3 p, vec3 n) {
    float swell = layeredNoise(p * vec3(0.22, 0.3, 0.38));
    float warp = layeredNoise(p * 0.9);
    float ripples = textureWave(p.x * 8.0 + p.z * 13.0 + p.y * 4.0 + warp * 5.0);
    float crossing = textureWave(p.x * -17.0 + p.z * 5.0 + warp * 6.0);
    float glints = pow(max(0.0, ripples * crossing), 6.0) * max(n.y, 0.0);
    return vec3(1.0) + swell * vec3(0.20, 0.29, 0.32)
      + vec3(ripples * 0.045 + crossing * 0.025 + glints * 0.14 + valueNoise(p * 35.0) * 0.04);
  }
`;
