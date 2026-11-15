"use client";
import { getState, levelProgressOf, statsOf, streakOf, totalHp, memberCard } from "./store";
import { tierFor } from "./points";
import { BADGES } from "./catalog";

/** If the member linked Discord, push a small summary after each run so the bot can show it. Fire and forget. */
export function syncToDiscord() {
  const s = getState();
  const token = s.profile?.discordToken;
  if (!token) return;
  const hp = totalHp(s);
  const summary = {
    handle: s.profile!.handle, hp, level: levelProgressOf(s).level, tier: tierFor(hp).name, runs: s.runs.filter((r) => r.ranked).length,
    streak: streakOf(s), squad: s.profile!.squad, badges: s.badges.map((id) => BADGES.find((b) => b.id === id)?.name ?? id), bests: s.bests,
    gamesPlayed: Object.keys(s.bests).length, wallTiles: s.tiles, bossDmg: s.bossDmg ?? 0,
  };
  void statsOf; void memberCard;
  fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, summary }), keepalive: true }).catch(() => {});
}
