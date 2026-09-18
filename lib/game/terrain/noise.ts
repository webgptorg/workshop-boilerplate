export function hash(x: number, z: number, seed: number): number {
  let value = Math.imul(x | 0, 374761393) ^ Math.imul(z | 0, 668265263) ^ seed;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export function smoothstep(min: number, max: number, n: number) {
  const t = clamp((n - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Smooth, deterministic lattice noise, continuous across positive and negative chunks. */
export class SeededNoise {
  constructor(readonly seed: number) {}

  sample(x: number, z: number) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
    return lerp(
      lerp(hash(ix, iz, this.seed), hash(ix + 1, iz, this.seed), u),
      lerp(hash(ix, iz + 1, this.seed), hash(ix + 1, iz + 1, this.seed), u),
      v,
    ) * 2 - 1;
  }

  fractal(x: number, z: number, octaves = 4) {
    let result = 0;
    let amplitude = 1;
    let weight = 0;
    for (let i = 0; i < octaves; i++) {
      result += this.sample(x, z) * amplitude;
      weight += amplitude;
      amplitude *= 0.48;
      x = x * 2.03 + 17.3;
      z = z * 2.03 - 11.7;
    }
    return result / weight;
  }
}
