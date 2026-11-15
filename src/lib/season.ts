/** Season 0 "Calibration": eight weeks with a shape, then a one week intermission. */
export const SEASON = { id: 0, name: "Calibration", start: "2026-11-09", host: "Gripp" };
export const WEEKS = [
  { n: 1, name: "Calibration", note: "Warm up the whole library. Calibrate counts double for quests.", host: "Moss" },
  { n: 2, name: "Pick and Place week", note: "Belts, bins and combos. Pick & Place is the featured game.", host: "Gripp" },
  { n: 3, name: "Latency week", note: "Lag Lab and Rail Dash take the spotlight.", host: "Moss" },
  { n: 4, name: "Prisms week", note: "Prism Bender and Prism Pop. Lumen explains the optics.", host: "Lumen" },
  { n: 5, name: "Squad war", note: "Squads fight for the crest glow on the wall.", host: "Dot" },
  { n: 6, name: "Boss week", note: "Glitch invades. Every ranked run does damage.", host: "Glitch" },
  { n: 7, name: "Creators week", note: "Captions, pixel art and question packs.", host: "Dot" },
  { n: 8, name: "Finale", note: "Last push. Finale week play pays a season bonus.", host: "Gripp" },
] as const;

export function seasonWeek(now = Date.now()) {
  const start = Date.parse(SEASON.start + "T00:00:00Z");
  const idx = Math.floor((now - start) / (7 * 864e5));
  return { idx, inSeason: idx >= 0 && idx < 8, week: WEEKS[Math.min(7, Math.max(0, idx))], intermission: idx >= 8 };
}

/** Glitch Hunt: damage per ranked run = score / 10, one member can add at most 5 percent of the bar. */
export const BOSS = { hp: 1_200_000, memberCapPct: 0.05, phases: [{ at: 0, name: "Wake up", text: "Glitch appears in a normal game with small glitches." }, { at: 0.25, name: "Spread", text: "Glitch copies itself into two games at once." }, { at: 0.55, name: "Panic", text: "Faster glitches and a flickering hub. Squads must team up." }, { at: 0.85, name: "Last stand", text: "One final push. Everyone counts." }] };
export const bossDamage = (score: number) => Math.floor(score / 10);
export const bossPhase = (pct: number) => [...BOSS.phases].reverse().find((p) => pct >= p.at)!;
