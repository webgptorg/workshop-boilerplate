import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import type { Scene } from "@babylonjs/core/scene";
import { SurfaceTexture, SURFACE_TEXTURE_GLSL } from "./surface-texture";

export function createTerrainMaterial(scene: Scene) {
  const material = new StandardMaterial("voxel-surfaces", scene);
  material.diffuseColor = Color3.White();
  material.specularColor = Color3.Black();
  material.ambientColor = Color3.White();
  material.maxSimultaneousLights = 2;
  new SurfaceTexture(material);
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
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 uv = vPosition.xz;
        vec2 cell = floor(uv * vec2(0.42, 1.5));
        float random = hash(cell);
        vec2 local = fract(uv * vec2(0.42, 1.5));
        float dash = smoothstep(0.04, 0.075, local.y) * (1.0 - smoothstep(0.095, 0.125, local.y));
        dash *= smoothstep(0.12, 0.19, local.x) * (1.0 - smoothstep(0.55, 0.7, local.x));
        dash *= step(0.67, random);
        float detail = 1.0 - smoothstep(18.0, 65.0, length(eye - vPosition));
        vec3 base = vColor * mix(1.0, surfaceTexture(vPosition), detail * 0.55);
        base += vec3(dash * 0.10 * max(vNormal.y, 0.0) * detail);
        base *= 0.91 + max(vNormal.y, 0.0) * 0.09;
        float fog = smoothstep(fogRange.x, fogRange.y, length(eye - vPosition));
        gl_FragColor = vec4(mix(base, fogColor, fog), 1.0);
      }
    `,
  }, { attributes: ["position", "normal", "color"], uniforms: ["worldViewProjection", "eye", "fogColor", "fogRange"] });
  material.backFaceCulling = false;
  return material;
}
