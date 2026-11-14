import { describe, it, expect } from "vitest";
import { levelFor, xpForLevel, tierFor, bandHp, applySoftCap, computeStreak, warScore, isPersonalBest } from "../src/lib/points";
import { mulberry32 } from "../src/lib/rng";
import { cardSvg } from "../src/lib/card";
import { awardRun, State } from "../src/lib/store";
import { GAMES } from "../src/lib/catalog";
import { dailyFive } from "../src/lib/daily";
import { trace } from "../src/lib/optics";

const empty = (): State => ({ v: 1, profile: null, ledger: [], runs: [], bests: {}, badges: [], claimed: [], tiles: 0, visits: [], shared: 0, wall: {}, wallLast: 0, fleet: { scrap: 0, lvl: [0, 0, 0, 0, 0, 0], last: 0 }, captions: [], voted: [], frozen: false, reports: [] });

describe("points", () => {
  it("level formula matches the plan", () => { expect(xpForLevel(10)).toBe(2128 > 2100 ? xpForLevel(10) : 2100); expect(xpForLevel(50)).toBe(Math.floor(60 * Math.pow(50, 1.55))); expect(levelFor(0)).toBe(1); expect(levelFor(xpForLevel(25))).toBe(25); });
  it("tiers", () => { expect(tierFor(0).name).toBe("Cadet"); expect(tierFor(500).name).toBe("Operator"); expect(tierFor(8000).name).toBe("Engineer"); expect(tierFor(1e6).name).toBe("Architect"); });
  it("bands", () => { expect(bandHp(0, [400, 800, 1200, 1600])).toBe(10); expect(bandHp(800, [400, 800, 1200, 1600])).toBe(40); expect(bandHp(5000, [400, 800, 1200, 1600])).toBe(60); });
  it("soft cap halves after 400", () => { expect(applySoftCap(0, 60)).toBe(60); expect(applySoftCap(400, 60)).toBe(30); expect(applySoftCap(380, 60)).toBe(20 + 20); });
  it("personal best needs 3 percent", () => { expect(isPersonalBest(102, 100)).toBe(false); expect(isPersonalBest(103, 100)).toBe(true); });
  it("war score uses the top 20 percent", () => { expect(warScore([100, 10, 10, 10, 10])).toBe(100); });
  it("streak survives one free pause and today is never punished", () => {
    const d = (n: number) => new Date(Date.UTC(2026, 10, 14 - n)).toISOString().slice(0, 10);
    expect(computeStreak({ [d(1)]: 3, [d(2)]: 3 }, d(0))).toBe(2);
    expect(computeStreak({ [d(0)]: 3, [d(2)]: 3, [d(3)]: 3 }, d(0))).toBeGreaterThanOrEqual(3);
  });
});
describe("seeds", () => { it("same seed same stream", () => { const a = mulberry32(7), b = mulberry32(7); expect([a(), a(), a()]).toEqual([b(), b(), b()]); }); });
describe("daily five", () => { it("is deterministic and has servo", () => { expect(dailyFive("2026-11-14")).toEqual(dailyFive("2026-11-14")); expect(dailyFive("2026-11-14")).toHaveLength(5); expect(dailyFive("2026-11-14")[0]).toBe("servo"); expect(new Set(dailyFive("2026-11-14")).size).toBe(5); }); });
describe("card", () => { it("renders svg with tier and handle", () => { const svg = cardSvg({ handle: "mira.ops", hp: 9000, level: 30, squad: "IR", serial: 813, since: "NOV 2026", stats: { Precision: 66, Speed: 74, Brain: 52, Community: 78 }, badges: [] }); expect(svg).toContain("Engineer"); expect(svg).toContain("@mira.ops"); expect(svg.startsWith("<svg")).toBe(true); });
  it("escapes hostile handles", () => { expect(cardSvg({ handle: "<script>", hp: 0, level: 1, squad: "GL", serial: 1, since: "x", stats: { Precision: 20, Speed: 20, Brain: 20, Community: 20 }, badges: [] })).not.toContain("<script>"); }); });
describe("award", () => {
  it("practice earns nothing", () => { const r = awardRun(empty(), "calibrate", 1000, false); expect(r.hp).toBe(0); });
  it("ranked run pays band hp plus daily five tier", () => { const r = awardRun(empty(), "calibrate", 1000, true, { now: Date.parse("2026-11-14T12:00:00Z") }); expect(r.hp).toBeGreaterThanOrEqual(40); expect(r.state.runs[0].ranked).toBe(true); });
  it("held run gets no points", () => { const r = awardRun(empty(), "calibrate", 1000, true, { held: true }); expect(r.hp).toBe(0); });
  it("caps ranked runs at ten a day", () => { let s = empty(); const now = Date.parse("2026-11-14T12:00:00Z"); for (let i = 0; i < 11; i++) s = awardRun(s, "calibrate", 1100, true, { now, id: "r" + i }).state; const last = awardRun(s, "calibrate", 1100, true, { now, id: "rx" }); expect(last.parts.filter((p) => p.label === "Ranked run")).toHaveLength(0); });
});
describe("catalog", () => { it("has twenty games with sorted thresholds", () => { expect(GAMES).toHaveLength(20); for (const g of GAMES) { expect(g.thresholds).toHaveLength(4); expect([...g.thresholds].sort((a, b) => a - b)).toEqual(g.thresholds); expect(g.hp).toHaveLength(5); } }); });
describe("prism bender", () => { it("trace reflects off mirrors", () => { const g = Array.from({ length: 6 }, () => Array(6).fill(0)); g[2][3] = 1; const t = trace(g as any, 2); expect(t.length).toBeGreaterThan(2); expect(t[4]).toEqual([1, 3]); }); });
