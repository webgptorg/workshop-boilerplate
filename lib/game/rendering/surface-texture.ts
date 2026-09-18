import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

/** Solid 3D value noise avoids UV seams/stretching on cliffs and cave ceilings.
 * Quantized samples and four tones keep the grain simple and low-poly.
 * No time input: local coordinates keep moving creatures' textures attached.
 */
export const SURFACE_TEXTURE_GLSL = `
  float surfaceHash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float surfaceNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(surfaceHash(cell), surfaceHash(cell + vec3(1,0,0)), f.x),
          mix(surfaceHash(cell + vec3(0,1,0)), surfaceHash(cell + vec3(1,1,0)), f.x), f.y),
      mix(mix(surfaceHash(cell + vec3(0,0,1)), surfaceHash(cell + vec3(1,0,1)), f.x),
          mix(surfaceHash(cell + vec3(0,1,1)), surfaceHash(cell + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float surfaceTexture(vec3 position) {
    vec3 cell = floor(position * 6.0);
    float noise = surfaceNoise(cell / 9.0) * 0.75 + surfaceHash(cell) * 0.25;
    return 0.88 + floor(clamp(noise, 0.0, 0.999) * 4.0) * 0.08;
  }
`;

/** Modulate albedo before Babylon's lighting, shadows and fog are applied. */
export class SurfaceTexture extends MaterialPluginBase {
  constructor(material: StandardMaterial) {
    super(material, "surface-texture", 200, {}, true, true);
  }

  override getCustomCode(shaderType: string): Record<string, string> | null {
    if (shaderType === "vertex") return {
      CUSTOM_VERTEX_DEFINITIONS: "varying vec3 vSurfacePosition;",
      CUSTOM_VERTEX_MAIN_END: "vSurfacePosition = position;",
    };
    if (shaderType === "fragment") return {
      CUSTOM_FRAGMENT_DEFINITIONS: `varying vec3 vSurfacePosition; ${SURFACE_TEXTURE_GLSL}`,
      // Fade fine grain before it becomes subpixel, reducing distant shimmer.
      CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
        float surfaceDetail = 1.0 - smoothstep(18.0, 65.0, length(vEyePosition.xyz - vPositionW));
        baseColor.rgb *= mix(1.0, surfaceTexture(vSurfacePosition), surfaceDetail);
      `,
    };
    return null;
  }
}
