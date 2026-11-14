/** Chapter 5: Hub Points, XP, levels, tiers. All pure functions, all tested. */
export const HP_NOTE = "Hub Points are a community game score, not an official PrismaX reward.";

export const TIERS = [
  { n: 1, roman: "I", name: "Cadet", from: 0, blurb: "Welcome. One game played." },
  { n: 2, roman: "II", name: "Operator", from: 500, blurb: "Regular. Plays a few days a week." },
  { n: 3, roman: "III", name: "Specialist", from: 2500, blurb: "Strong all rounder." },
  { n: 4, roman: "IV", name: "Engineer", from: 8000, blurb: "Dedicated. Gold frame, dark card." },
  { n: 5, roman: "V", name: "Architect", from: 20000, blurb: "Top contributors. Dark card with gold foil." },
  { n: 6, roman: "VI", name: "Genesis", from: Infinity, blurb: "Founders and season champions. Invite only." },
] as const;

export function tierFor(hp: number) {
  let t: (typeof TIERS)[number] = TIERS[0];
  for (const x of TIERS) if (x.from !== Infinity && hp >= x.from) t = x;
  return t;
}
export function nextTier(hp: number) {
  const t = tierFor(hp);
  return TIERS.find((x) => x.n === t.n + 1 && x.from !== Infinity) ?? null;
}

/** Total XP needed to reach level L: floor(60 * L^1.55) */
export const xpForLevel = (L: number) => Math.floor(60 * Math.pow(L, 1.55));
export function levelFor(xp: number): number {
  let L = 1;
  while (L < 99 && xpForLevel(L + 1) <= xp) L++;
  return L;
}
export function levelProgress(xp: number) {
  const L = levelFor(xp);
  const lo = L === 1 ? 0 : xpForLevel(L);
  const hi = xpForLevel(L + 1);
  return { level: L, into: xp - lo, span: hi - lo, pct: Math.max(0, Math.min(1, (xp - lo) / (hi - lo))) };
}

export const DEFAULT_HP = [10, 25, 40, 50, 60] as const;
/** thresholds = lower bounds of the 2nd..5th bands */
export function bandIndex(score: number, thresholds: readonly number[]): number {
  let i = 0;
  for (let k = 0; k < thresholds.length; k++) if (score >= thresholds[k]) i = k + 1;
  return i;
}
export function bandHp(score: number, thresholds: readonly number[], table: readonly number[] = DEFAULT_HP): number {
  return table[bandIndex(score, thresholds)];
}

export const CAPS = {
  rankedRunsPerDay: 10,
  softCap: 400, // after this many HP in a day, points arrive at half rate
  varietyGames: 5,
  varietyBonus: 25,
  pbBonus: 15,
  pbMinImprovement: 0.03,
  dailyFive: { 1: 10, 3: 30, 5: 100 } as Record<number, number>,
  streakRunsPerDay: 3,
};

export const isPersonalBest = (score: number, prev: number | undefined) =>
  prev !== undefined && prev > 0 && score >= prev * (1 + CAPS.pbMinImprovement);

/** Apply the daily soft cap: HP past the cap count half. */
export function applySoftCap(earnedToday: number, gain: number): number {
  if (gain <= 0) return 0;
  const room = Math.max(0, CAPS.softCap - earnedToday);
  if (gain <= room) return gain;
  return room + Math.floor((gain - room) / 2);
}

/** 0..100 stat from scaled scores (0..1 each). Floor of 20. */
export function statFrom(scaled: number[]): number {
  if (!scaled.length) return 20;
  const avg = scaled.reduce((a, b) => a + b, 0) / scaled.length;
  return Math.round(20 + 80 * Math.min(1, Math.max(0, avg)));
}

/** Streak: consecutive days with >= 3 ranked runs. One free pause per week. */
export function computeStreak(dayCounts: Record<string, number>, today: string) {
  const ok = (d: string) => (dayCounts[d] ?? 0) >= CAPS.streakRunsPerDay;
  const addDays = (d: string, n: number) => {
    const t = new Date(d + "T00:00:00Z");
    t.setUTCDate(t.getUTCDate() + n);
    return t.toISOString().slice(0, 10);
  };
  let streak = 0;
  let d = today;
  if (!ok(d)) d = addDays(d, -1); // today is still open, never punished
  let pausesUsed = 0;
  let sinceWeekStart = 0;
  for (let i = 0; i < 400; i++) {
    if (ok(d)) {
      streak++;
    } else if (pausesUsed * 7 < sinceWeekStart + 7 && sinceWeekStart >= 0 && canPause(d)) {
      pausesUsed++;
    } else break;
    sinceWeekStart++;
    d = addDays(d, -1);
  }
  function canPause(day: string) {
    // a pause is only valid if the day before is a streak day (not a long gap)
    return ok(addDays(day, -1));
  }
  return streak;
}

/** War score = sum of the top 20 percent of members, so one star cannot carry a team. */
export function warScore(points: number[]): number {
  const sorted = [...points].sort((a, b) => b - a);
  return sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.2))).reduce((a, b) => a + b, 0);
}
