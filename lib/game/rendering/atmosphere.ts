import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import { WORLD_CONFIG } from "../config";
import { hash } from "../terrain/noise";
import type { GameSystem } from "../types";
import { PIXEL_GRAIN_GLSL, PROCEDURAL_NOISE_GLSL, ProceduralSurfacePlugin } from "./procedural-textures";
import { GeometryBuffer } from "./geometry";

const SHADOW_MAP_SIZE = 2048;
const SHADOW_SPAN = 112;
const SUN_DIRECTION = new Vector3(0.6, -1, 0.45).normalize();
const SHADOW_RIGHT = Vector3.Cross(Vector3.Up(), SUN_DIRECTION).normalize();
const SHADOW_UP = Vector3.Cross(SUN_DIRECTION, SHADOW_RIGHT).normalize();

export class Atmosphere implements GameSystem {
  readonly shadows: ShadowGenerator;
  readonly fogColor = new Color3(0.77, 0.84, 0.82);
  readonly fogRange = new Vector2(80, WORLD_CONFIG.chunkSize * (WORLD_CONFIG.renderDistance - 0.7));
  private readonly sun: DirectionalLight;
  private readonly ambient: HemisphericLight;
  private readonly sky: Mesh;
  private readonly skyMaterial: ShaderMaterial;
  private readonly cloudMaterial: StandardMaterial;
  private readonly clouds: { mesh: Mesh; x: number; z: number }[] = [];
  private time = 0;

  constructor(readonly scene: Scene, readonly camera: Camera) {
    scene.clearColor = new Color4(this.fogColor.r, this.fogColor.g, this.fogColor.b, 1);
    scene.fogMode = Scene.FOGMODE_LINEAR;
    scene.fogStart = this.fogRange.x;
    scene.fogEnd = this.fogRange.y;
    scene.fogColor = this.fogColor;
    scene.ambientColor = new Color3(0.055, 0.065, 0.075);
    scene.imageProcessingConfiguration.exposure = 0.98;
    scene.imageProcessingConfiguration.contrast = 1.04;
    this.ambient = new HemisphericLight("sky-light", new Vector3(0, 1, 0), scene);
    this.ambient.intensity = 0.53;
    this.ambient.diffuse = new Color3(0.93, 0.97, 1);
    this.ambient.groundColor = new Color3(0.52, 0.49, 0.38);
    this.sun = new DirectionalLight("sun", SUN_DIRECTION.clone(), scene);
    this.sun.diffuse = new Color3(1, 0.94, 0.78);
    this.sun.intensity = 1.12;
    this.sun.shadowFrustumSize = SHADOW_SPAN;
    this.sun.shadowMinZ = 1;
    this.sun.shadowMaxZ = 200;
    this.shadows = new ShadowGenerator(SHADOW_MAP_SIZE, this.sun);
    this.shadows.useContactHardeningShadow = true;
    this.shadows.contactHardeningLightSizeUVRatio = 0.025;
    this.shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadows.bias = 0.001;
    this.shadows.normalBias = 0.12;
    this.shadows.frustumEdgeFalloff = 0.15;
    this.shadows.setDarkness(0.2);
    this.skyMaterial = new ShaderMaterial("procedural-sky", scene, {
      vertexSource: `
        precision highp float;
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        varying vec3 vDirection;
        void main() { vDirection = position; gl_Position = worldViewProjection * vec4(position, 1.0); }
      `,
      fragmentSource: `
        precision highp float;
        varying vec3 vDirection;
        ${PROCEDURAL_NOISE_GLSL}
        ${PIXEL_GRAIN_GLSL}
        void main() {
          vec3 direction = normalize(vDirection);
          // Direction-space noise is continuous across sky-box faces and still in time.
          float atmosphere = layeredNoise(direction * 14.0);
          float detail = layeredNoise(direction * 85.0);
          float height = clamp(direction.y * 0.85 + 0.15 + atmosphere * 0.5, 0.0, 1.0);
          vec3 horizon = vec3(0.80, 0.86, 0.83);
          vec3 zenith = vec3(0.48, 0.68, 0.77);
          vec3 sky = mix(horizon, zenith, height) + vec3(atmosphere * 0.055 + detail * 0.035);
          float sun = max(0.0, dot(direction, normalize(vec3(-0.6, 1.0, -0.45))));
          sky += vec3(0.12, 0.095, 0.045) * pow(sun, 10.0);
          sky = mix(sky, vec3(1.0, 0.96, 0.78) + vec3(detail * 0.035), smoothstep(0.9985, 0.9992, sun));
          gl_FragColor = vec4(sky + vec3(pixelGrain() * 0.012), 1.0);
        }
      `,
    }, { attributes: ["position"], uniforms: ["worldViewProjection"] });
    this.skyMaterial.backFaceCulling = false;
    this.skyMaterial.disableDepthWrite = true;
    this.sky = CreateBox("sky", { size: 700 }, scene);
    this.sky.material = this.skyMaterial;
    this.sky.isPickable = false;
    this.sky.infiniteDistance = true;
    this.cloudMaterial = new StandardMaterial("clouds", scene);
    this.cloudMaterial.diffuseColor = new Color3(0.94, 0.94, 0.86);
    this.cloudMaterial.emissiveColor = new Color3(0.20, 0.21, 0.20);
    this.cloudMaterial.specularColor = Color3.Black();
    this.cloudMaterial.disableLighting = false;
    new ProceduralSurfacePlugin(this.cloudMaterial, 0.10);
    for (let i = 0; i < 22; i++) {
      const geometry = new GeometryBuffer();
      const seed = WORLD_CONFIG.seed + i * 47;
      const width = 9 + hash(i, 1, seed) * 13;
      const depth = 4 + hash(i, 2, seed) * 7;
      geometry.box({ x: 0, y: 0, z: 0 }, { x: width, y: 1.3, z: depth }, [0.94, 0.95, 0.91]);
      geometry.box({ x: width * 0.18, y: 1.3, z: depth * 0.1 }, { x: width * 0.55, y: 1.5, z: depth * 0.75 }, [0.98, 0.98, 0.94]);
      const mesh = new Mesh(`cloud-${i}`, scene);
      geometry.apply(mesh);
      mesh.material = this.cloudMaterial;
      mesh.isPickable = false;
      mesh.applyFog = false;
      mesh.position.y = 58 + hash(i, 3, seed) * 20;
      this.clouds.push({ mesh, x: hash(i, 4, seed) * 400 - 200, z: hash(i, 5, seed) * 400 - 200 });
    }
  }

  update(delta: number) {
    this.time += delta;
    const p = this.camera.position;
    this.sky.position.copyFrom(p);
    // Snap in light space to keep the shadow texels stable as the camera walks.
    const texel = SHADOW_SPAN / SHADOW_MAP_SIZE;
    const right = Math.round(Vector3.Dot(p, SHADOW_RIGHT) / texel) * texel;
    const up = Math.round(Vector3.Dot(p, SHADOW_UP) / texel) * texel;
    const depth = Vector3.Dot(p, SUN_DIRECTION) - 100;
    this.sun.position.set(
      SHADOW_RIGHT.x * right + SHADOW_UP.x * up + SUN_DIRECTION.x * depth,
      SHADOW_RIGHT.y * right + SHADOW_UP.y * up + SUN_DIRECTION.y * depth,
      SHADOW_RIGHT.z * right + SHADOW_UP.z * up + SUN_DIRECTION.z * depth,
    );
    for (const cloud of this.clouds) {
      cloud.mesh.position.x = p.x + ((cloud.x + this.time * 0.2 - p.x + 600) % 400 + 400) % 400 - 200;
      cloud.mesh.position.z = p.z + ((cloud.z - p.z + 600) % 400 + 400) % 400 - 200;
    }
  }

  dispose() {
    this.shadows.dispose(); this.sun.dispose(); this.ambient.dispose();
    this.sky.dispose(); this.skyMaterial.dispose(); this.cloudMaterial.dispose();
    for (const cloud of this.clouds) cloud.mesh.dispose();
  }
}
