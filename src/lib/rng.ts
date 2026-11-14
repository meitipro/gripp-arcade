/** Seeded generators. Games use ONLY these for randomness so a seed replays exactly. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export type Rand = () => number;

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
export const randInt = (r: Rand, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const pick = <T,>(r: Rand, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];
export function shuffle<T>(r: Rand, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** UTC date key like 2026-11-14 */
export const utcDay = (d: Date = new Date()) => d.toISOString().slice(0, 10);
