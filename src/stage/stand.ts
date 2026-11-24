// Standing a uniformed cutout on the ground. Each drawing leaves a different gap under the feet,
// so the same `y` puts some of them in mid-air. This knows where each one's feet are.

import type { CharId, Job } from '../game/types';

/**
 * How far down its picture each uniform drawing's feet reach, as a fraction of the picture's
 * height. Measured from the drawings in src/assets/characters; one that is missing here is
 * taken to fill its picture in the usual way.
 */
const FEET: Record<string, number> = {
  'chiikawa.nurse': 0.9707,
  'furuhonya.nurse': 0.9761,
  'hachiware.nurse': 0.9522,
  'kurimanju.nurse': 0.9826,
  'momonga.nurse': 0.9587,
  'rakko.doctor': 1,
  'shisa.nurse': 0.9663,
  'usagi.doctor': 1,
  'usagi.nurse': 0.9793,
};

/** The `y` to give a Cutout of scale `s` so that this drawing's feet land on the line `ground`. */
export function standY(char: CharId, job: Job, s: number, ground: number): number {
  const feet = FEET[`${char}.${job}`] ?? 0.957;
  // A drawing is enlarged 1.2 times about a point 95.7% of the way down its box (see .wob > img).
  return Math.round(ground + 460 * s * (0.043 - 1.2 * (feet - 0.957)));
}
