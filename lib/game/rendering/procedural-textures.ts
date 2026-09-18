import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { WORLD_CONFIG } from "../config";

/** Seeded, continuous 3D value noise shared by the sky and every surface.
 * Each octave fades before becoming smaller than a fragment to avoid shimmer.
 */
export const PROCEDURAL_NOISE_GLSL = `
  float noiseHash(vec3 p) {
    p = fract(p * 0.1031 + ${(WORLD_CONFIG.seed % 997 / 997).toFixed(6)});
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float valueNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    vec3 blend = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float lower = mix(
      mix(noiseHash(cell), noiseHash(cell + vec3(1, 0, 0)), blend.x),
      mix(noiseHash(cell + vec3(0, 1, 0)), noiseHash(cell + vec3(1, 1, 0)), blend.x), blend.y);
    float upper = mix(
      mix(noiseHash(cell + vec3(0, 0, 1)), noiseHash(cell + vec3(1, 0, 1)), blend.x),
      mix(noiseHash(cell + vec3(0, 1, 1)), noiseHash(cell + vec3(1, 1, 1)), blend.x), blend.y);
    float footprint = max(length(dFdx(p)), length(dFdy(p)));
    return (mix(lower, upper, blend.z) - 0.5)
      * (1.0 - smoothstep(0.3, 1.0, footprint));
  }
  float layeredNoise(vec3 p) {
    // Offset and rotate successive octaves to keep the lattice out of the artwork.
    return valueNoise(p) * 0.60
      + valueNoise(p.yzx * 2.57 + vec3(17.3, 9.2, 31.7)) * 0.28
      + valueNoise(p.zxy * 6.13 + vec3(43.1, 27.4, 11.8)) * 0.12;
  }
`;

/** Analytic vector-like cells, evaluated directly at each fragment: no image assets,
 * UV grid, texture downloads or animation. The seed matches the generated world.
 */
export const SURFACE_TEXTURE_GLSL = `
  ${PROCEDURAL_NOISE_GLSL}
  vec2 surfaceHash(vec2 p) {
    vec3 h = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    h += dot(h, h.yzx + 33.33);
    return fract((h.xx + h.yz) * h.zy);
  }
  float polygonTexture(vec2 p) {
    p += vec2(${(WORLD_CONFIG.seed % 997).toFixed(1)}, ${(WORLD_CONFIG.seed % 619).toFixed(1)});
    vec2 cell = floor(p);
    vec2 local = fract(p);
    float nearest = 10.0;
    float second = 10.0;
    float tone = 0.5;
    float secondTone = 0.5;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        vec2 random = surfaceHash(cell + offset);
        vec2 delta = offset + 0.5 + (random - 0.5) * 0.8 - local;
        float distanceSquared = dot(delta, delta);
        float candidate = surfaceHash(cell + offset + 19.7).x;
        if (distanceSquared < nearest) {
          second = nearest;
          secondTone = tone;
          nearest = distanceSquared;
          tone = candidate;
        } else if (distanceSquared < second) {
          second = distanceSquared;
          secondTone = candidate;
        }
      }
    }
    // Antialias polygon boundaries and fade subpixel cells into their mean.
    float footprint = max(length(dFdx(p)), length(dFdy(p)));
    float edge = smoothstep(0.0, max(0.001, footprint * 1.4), second - nearest);
    return (mix((tone + secondTone) * 0.5, tone, edge) - 0.5)
      * (1.0 - smoothstep(0.35, 1.2, footprint));
  }
  float surfaceTexture(vec3 p, vec3 normal) {
    vec3 weights = pow(abs(normal), vec3(8.0));
    weights /= max(dot(weights, vec3(1.0)), 0.001);
    float facets = dot(vec3(polygonTexture(p.yz * 3.4),
                            polygonTexture(p.xz * 3.4),
                            polygonTexture(p.xy * 3.4)), weights);
    // Smaller facets establish the low-poly style; continuous fine noise breaks
    // up their interiors so even a close-up face never becomes a flat fill.
    return facets * 0.65 + layeredNoise(p * 9.0) * 0.85;
  }
`;

/** Screen-space grain stays fixed in time and is never enlarged with distance.
 * Native framebuffer resolution makes one noise sample one physical screen pixel.
 */
export const PIXEL_GRAIN_GLSL = `
  float pixelGrain() {
    return fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy),
      vec2(0.06711056, 0.00583715)))) - 0.5;
  }
`;

/** Retain Babylon's lighting, vertex colors, fog and shadows. Object coordinates
 * keep moving creatures/clouds attached to their texture; chunk vertices already
 * use world coordinates, so adjacent chunks sample exactly the same pattern.
 */
export class ProceduralSurfacePlugin extends MaterialPluginBase {
  constructor(material: StandardMaterial, private readonly strength = 0.24) {
    super(material, "ProceduralSurface", 200, {}, false);
    this._pluginManager._addPlugin(this);
    this._enable(true);
  }

  override getCustomCode(shaderType: string): Record<string, string> | null {
    if (shaderType === "vertex") return {
      CUSTOM_VERTEX_DEFINITIONS: "varying vec3 vSurfacePosition; varying vec3 vSurfaceNormal;",
      CUSTOM_VERTEX_MAIN_BEGIN: "vSurfacePosition = position; vSurfaceNormal = normal;",
    };
    if (shaderType === "fragment") return {
      CUSTOM_FRAGMENT_DEFINITIONS: `
        varying vec3 vSurfacePosition;
        varying vec3 vSurfaceNormal;
        ${SURFACE_TEXTURE_GLSL}
        ${PIXEL_GRAIN_GLSL}
      `,
      CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `baseColor.rgb *= 1.0 + surfaceTexture(vSurfacePosition, normalize(vSurfaceNormal)) * ${this.strength.toFixed(3)};`,
      CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR: "color.rgb = clamp(color.rgb + vec3(pixelGrain() * 0.018), 0.0, 1.0);",
    };
    return null;
  }
}
