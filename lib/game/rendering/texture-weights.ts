/** Slots follow the built-in block IDs; slot zero is the neutral detail texture.
 * Three vec4 attributes let smooth terrain blend real material identities without
 * guessing from color or interpolating IDs into an unrelated material.
 */
export const TEXTURE_SLOTS = 12;
export const TEXTURE_ATTRIBUTES = ["textureWeights0", "textureWeights1", "textureWeights2"] as const;

export function textureWeights(id = 0): number[] {
  const weights = Array<number>(TEXTURE_SLOTS).fill(0);
  weights[Number.isInteger(id) && id >= 0 && id < TEXTURE_SLOTS ? id : 0] = 1;
  return weights;
}
