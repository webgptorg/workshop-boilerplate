import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { PIXEL_GRAIN_GLSL, SURFACE_TEXTURE_GLSL, ProceduralSurfacePlugin } from "./procedural-textures";
import type { Scene } from "@babylonjs/core/scene";

export function createTerrainMaterial(scene: Scene) {
  const material = new StandardMaterial("voxel-surfaces", scene);
  material.diffuseColor = Color3.White();
  material.specularColor = Color3.Black();
  material.ambientColor = Color3.White();
  material.maxSimultaneousLights = 2;
  new ProceduralSurfacePlugin(material);
  return material;
}

export function createWaterMaterial(scene: Scene) {
  const material = new ShaderMaterial("water", scene, {
    vertexSource: `
      precision highp float;
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec4 color;
      uniform mat4 worldViewProjection;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vColor;
      void main() {
        vPosition = position;
        vNormal = normal;
        vColor = color.rgb;
        gl_Position = worldViewProjection * vec4(position, 1.0);
      }
    `,
    fragmentSource: `
      precision highp float;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vColor;
      uniform vec3 eye;
      uniform vec3 fogColor;
      uniform vec2 fogRange;
      ${SURFACE_TEXTURE_GLSL}
      ${PIXEL_GRAIN_GLSL}
      void main() {
        // Long, irregular polygon facets suggest calm water without scrolling.
        vec3 base = vColor * (1.0 + surfaceTexture(vPosition * vec3(0.4, 1.0, 1.3), vNormal) * 0.20);
        base *= 0.91 + max(vNormal.y, 0.0) * 0.09;
        float fog = smoothstep(fogRange.x, fogRange.y, length(eye - vPosition));
        gl_FragColor = vec4(clamp(mix(base, fogColor, fog) + vec3(pixelGrain() * 0.018), 0.0, 1.0), 1.0);
      }
    `,
  }, { attributes: ["position", "normal", "color"], uniforms: ["worldViewProjection", "eye", "fogColor", "fogRange"] });
  material.backFaceCulling = false;
  return material;
}
