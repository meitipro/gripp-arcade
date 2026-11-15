"use client";
import { useSyncExternalStore } from "react";
import { GAMES, gameById, QUESTS } from "./catalog";
import { applySoftCap, bandHp, CAPS, computeStreak, isPersonalBest, levelFor, statFrom, tierFor } from "./points";
import { utcDay } from "./rng";
import { BOSS, bossDamage } from "./season";
import { dailyFive } from "./daily";

export interface Profile {
  handle: string; face: "robot" | "photo"; squad: string; locale: "en" | "fa";
  calm: boolean; joined: string; serial: number; pinned: string[];
}
export interface LedgerRow { id: string; kind: string; amount: number; xp: number; ref: string; day: string; ts: number }
export interface Run { id: string; game: string; score: number; hp: number; ranked: boolean; status: "counted" | "held" | "reversed"; day: string; ts: number }
export interface State {
  v: 1; profile: Profile | null; ledger: LedgerRow[]; runs: Run[]; bests: Record<string, number>;
  badges: string[]; claimed: string[]; tiles: number; visits: string[]; shared: number;
  wall: Record<string, number>; wallLast: number; fleet: { scrap: number; lvl: number[]; last: number };
  captions: { scene: number; text: string; votes: number }[]; voted: string[]; frozen: boolean;
  reports: { id: string; kind: string; target: string; status: string; ts: number }[];
  bossDmg: number;
}
const KEY = "gripp-arcade:v1";
const EMPTY: State = {
  v: 1, profile: null, ledger: [], runs: [], bests: {}, badges: [], claimed: [], tiles: 0, visits: [], shared: 0,
  wall: {}, wallLast: 0, fleet: { scrap: 0, lvl: [0, 0, 0, 0, 0, 0], last: 0 }, captions: [], voted: [], frozen: false, reports: [], bossDmg: 0,
};

let state: State = EMPTY;
let loaded = false;
const subs = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...EMPTY, ...JSON.parse(raw) }; } catch {}
}
function emit() { for (const s of subs) s(); }
export function getState(): State { load(); return state; }
export function update(fn: (s: State) => State) {
  load();
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  emit();
}
export function resetAll() { state = EMPTY; try { localStorage.removeItem(KEY); } catch {} emit(); }
function subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; }
export function useStore(): State {
  return useSyncExternalStore(subscribe, getState, () => EMPTY);
}

/* ---------- derived ---------- */
export const totalHp = (s: State) => s.ledger.reduce((a, r) => a + r.amount, 0);
export const totalXp = (s: State) => s.ledger.reduce((a, r) => a + r.xp, 0);
export const earnedOn = (s: State, day: string) => s.ledger.filter((r) => r.day === day && r.amount > 0 && r.kind !== "reversal").reduce((a, r) => a + r.amount, 0);
export const rankedOn = (s: State, day: string) => s.runs.filter((r) => r.ranked && r.day === day && r.status !== "reversed");

export function dayCounts(s: State) {
  const m: Record<string, number> = {};
  for (const r of s.runs) if (r.ranked && r.status !== "reversed") m[r.day] = (m[r.day] ?? 0) + 1;
  return m;
}
export const streakOf = (s: State, today = utcDay()) => computeStreak(dayCounts(s), today);

export { dailyFive };
export const dailyDone = (s: State, day = utcDay()) => {
  const set = new Set(rankedOn(s, day).map((r) => r.game));
  return dailyFive(day).filter((id) => set.has(id));
};

export function statsOf(s: State) {
  const out: Record<string, number> = {};
  for (const stat of ["Precision", "Speed", "Brain", "Community"] as const) {
    const scaled: number[] = [];
    for (const g of GAMES) if (g.stats.includes(stat) && s.bests[g.id] !== undefined) scaled.push(Math.min(1, s.bests[g.id] / g.par));
    out[stat] = statFrom(scaled);
  }
  out.Community = Math.min(100, out.Community + Math.min(10, Math.floor(s.visits.length / 3)));
  return out as { Precision: number; Speed: number; Brain: number; Community: number };
}

export function questStatus(s: State, id: string): { done: boolean; progress: string } {
  const today = utcDay();
  const todayRuns = rankedOn(s, today);
  switch (id) {
    case "warm": return { done: todayRuns.length >= 2, progress: `${Math.min(2, todayRuns.length)}/2` };
    case "new": { const n = new Set(todayRuns.map((r) => r.game)).size; return { done: n >= 3, progress: `${Math.min(3, n)}/3` }; }
    case "perfect": { const b = Math.max(0, ...todayRuns.filter((r) => r.game === "pick-place").map((r) => r.score)); return { done: b >= 800, progress: `${b}/800` }; }
    case "fingers": { const b = Math.max(0, ...todayRuns.filter((r) => r.game === "command-line").map((r) => r.score)); return { done: b >= 250, progress: `${b}/250` }; }
    case "rhythm": { const c = dayCounts(s); const wk = Object.entries(c).filter(([d, n]) => n >= 3 && Date.now() - new Date(d).getTime() < 7 * 864e5).length; return { done: wk >= 5, progress: `${Math.min(5, wk)}/5` }; }
    case "bests": { const n = s.ledger.filter((r) => r.kind === "personal-best" && Date.now() - r.ts < 7 * 864e5).length; return { done: n >= 3, progress: `${Math.min(3, n)}/3` }; }
    case "share": return { done: s.shared > 0, progress: `${Math.min(1, s.shared)}/1` };
    case "wall": return { done: s.visits.length >= 10, progress: `${Math.min(10, s.visits.length)}/10` };
    case "spec": { const hp = totalHp(s); return { done: hp >= 2500, progress: `${Math.min(2500, hp)}/2500` }; }
    case "pixel": return { done: s.tiles >= 100, progress: `${Math.min(100, s.tiles)}/100` };
  }
  return { done: false, progress: "" };
}

/* ---------- awarding (pure) ---------- */
export interface AwardResult { state: State; hp: number; parts: { label: string; hp: number }[]; held: boolean; note?: string; newBadges: string[]; level: number; tierUp: boolean }

export function awardRun(s: State, gameId: string, score: number, ranked: boolean, opts: { held?: boolean; id?: string; now?: number } = {}): AwardResult {
  const g = gameById(gameId)!;
  const now = opts.now ?? Date.now();
  const day = utcDay(new Date(now));
  const id = opts.id ?? `r${now}${Math.floor(Math.random() * 1e4)}`;
  const parts: { label: string; hp: number }[] = [];
  const hpBefore = totalHp(s);
  if (!ranked) {
    return { state: s, hp: 0, parts, held: false, note: "Practice run. Practice never touches boards or points.", newBadges: [], level: levelFor(totalXp(s)), tierUp: false };
  }
  const todays = rankedOn(s, day);
  let base = score > 0 || g.id === "servo" ? bandHp(score, g.thresholds, g.hp) : 0;
  if (score <= 0 && g.id !== "servo") base = 0;
  let note: string | undefined;
  let gains: { kind: string; amount: number; label: string }[] = [];
  const held = !!opts.held;
  if (todays.length >= CAPS.rankedRunsPerDay) { base = 0; note = "Daily cap of 10 ranked runs reached. This run still counts for boards, not for points."; }
  if (held) { base = 0; note = "This run is held for a quiet review. No points yet."; }
  if (base > 0) gains.push({ kind: "ranked-run", amount: base, label: "Ranked run" });
  const prev = s.bests[g.id];
  if (!held && base > 0 && isPersonalBest(score, prev)) gains.push({ kind: "personal-best", amount: CAPS.pbBonus, label: "Personal best" });
  const firstToday = !todays.some((r) => r.game === g.id);
  if (!held && base > 0 && firstToday) {
    const distinct = new Set(todays.map((r) => r.game)); distinct.add(g.id);
    if (distinct.size === CAPS.varietyGames) gains.push({ kind: "variety", amount: CAPS.varietyBonus, label: "Variety bonus" });
  }
  // Daily Five
  const five = dailyFive(day);
  const doneBefore = new Set(todays.filter((r) => five.includes(r.game)).map((r) => r.game)).size;
  const doneAfter = doneBefore + (five.includes(g.id) && firstToday ? 1 : 0);
  if (!held && base > 0) for (const k of [1, 3, 5]) if (doneBefore < k && doneAfter >= k) gains.push({ kind: "daily-five", amount: CAPS.dailyFive[k], label: `Daily Five ${k}/5` });
  // soft cap
  let earned = earnedOn(s, day);
  const ledger = s.ledger.slice();
  let total = 0;
  for (const gn of gains) {
    const real = applySoftCap(earned, gn.amount);
    earned += real; total += real;
    parts.push({ label: gn.label + (real < gn.amount ? " (half rate)" : ""), hp: real });
    ledger.push({ id: `${id}:${gn.kind}`, kind: gn.kind, amount: real, xp: real, ref: g.id, day, ts: now });
  }
  if (ranked && !held && base > 0) ledger.push({ id: `${id}:xp`, kind: "xp", amount: 0, xp: 5 + Math.round(score / Math.max(1, g.par) * 10), ref: g.id, day, ts: now });
  const bests = { ...s.bests };
  if (!held && score > (bests[g.id] ?? 0)) bests[g.id] = score;
  const run: Run = { id, game: g.id, score, hp: total, ranked, status: held ? "held" : "counted", day, ts: now };
  const runs = [run, ...s.runs].slice(0, 400);
  const dmg = !held && ranked ? Math.min(Math.floor(BOSS.hp * BOSS.memberCapPct) - (s.bossDmg ?? 0), bossDamage(score)) : 0;
  let next: State = { ...s, ledger, runs, bests, bossDmg: (s.bossDmg ?? 0) + Math.max(0, dmg) };
  // badges
  const badges = new Set(next.badges); const before = badges.size;
  badges.add("first");
  if (ledger.some((r) => r.kind === "personal-best")) badges.add("pb");
  if (dailyDone(next, day).length === 5) badges.add("daily5");
  const st = streakOf(next, day);
  if (st >= 3) badges.add("steady");
  if (st >= 7) badges.add("week");
  if (new Set(runs.filter((r) => r.ranked).map((r) => r.game)).size >= 10) badges.add("all");
  if (tierFor(totalHp(next)).n >= 3) badges.add("spec");
  const newBadges = [...badges].filter((b) => !next.badges.includes(b));
  next = { ...next, badges: [...badges] };
  void before;
  // quests
  const claimed = next.claimed.slice();
  for (const q of QUESTS) {
    const key = q.cycle + ":" + q.id + ":" + (q.cycle === "Daily" ? day : q.cycle === "Weekly" ? weekKey(now) : "season0");
    if (!claimed.includes(key) && questStatus(next, q.id).done) {
      claimed.push(key);
      const real = applySoftCap(earned, q.hp); earned += real; total += real;
      next.ledger.push({ id: `${id}:q:${q.id}`, kind: "quest", amount: real, xp: real, ref: q.id, day, ts: now });
      parts.push({ label: `Quest: ${q.name}`, hp: real });
    }
  }
  next = { ...next, claimed };
  next.runs[0] = { ...next.runs[0], hp: total };
  const hpAfter = totalHp(next);
  return { state: next, hp: total, parts, held, note, newBadges, level: levelFor(totalXp(next)), tierUp: tierFor(hpAfter).n > tierFor(hpBefore).n };
}
export function weekKey(ts: number) {
  const d = new Date(ts); const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - dow);
  return t.toISOString().slice(0, 10);
}

/** Staff reversal: flag a run, take its points back with an audit-style ledger row. */
export function reverseRun(s: State, runId: string): State {
  const run = s.runs.find((r) => r.id === runId);
  if (!run || run.status === "reversed") return s;
  const rows = s.ledger.filter((r) => r.id.startsWith(runId + ":") && r.kind !== "xp" && !r.id.includes(":q:"));
  const back = rows.reduce((a, r) => a + r.amount, 0);
  const runs = s.runs.map((r) => (r.id === runId ? { ...r, status: "reversed" as const } : r));
  const ledger = [...s.ledger, { id: `${runId}:reversal`, kind: "reversal", amount: -back, xp: -back, ref: run.game, day: utcDay(), ts: Date.now() }];
  return { ...s, runs, ledger };
}
export function releaseRun(s: State, runId: string): State {
  const run = s.runs.find((r) => r.id === runId);
  if (!run || run.status !== "held") return s;
  const g = gameById(run.game)!;
  const hp = bandHp(run.score, g.thresholds, g.hp);
  const ledger = [...s.ledger, { id: `${runId}:ranked-run`, kind: "ranked-run", amount: hp, xp: hp, ref: g.id, day: run.day, ts: Date.now() }];
  const bests = { ...s.bests }; if (run.score > (bests[g.id] ?? 0)) bests[g.id] = run.score;
  return { ...s, runs: s.runs.map((r) => (r.id === runId ? { ...r, status: "counted", hp } : r)), ledger, bests };
}

import { levelProgress } from "./points";
import { BADGES } from "./catalog";
import type { CardData } from "./card";
export const levelProgressOf = (s: State) => levelProgress(totalXp(s));
export function memberCard(s: State): CardData {
  const hp = totalHp(s);
  const p = s.profile;
  const pinned = (p?.pinned?.length ? p.pinned : s.badges).map((id) => BADGES.find((b) => b.id === id)?.name ?? id);
  return { handle: p?.handle ?? "operator", hp, level: levelFor(totalXp(s)), squad: p?.squad ?? "GL", serial: p?.serial ?? 1, since: p?.joined ?? "NOV 2026", stats: statsOf(s), badges: pinned };
}
