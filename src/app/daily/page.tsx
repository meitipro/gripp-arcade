"use client";
import Link from "next/link";
import { dailyDone, dailyFive, streakOf, useStore } from "@/lib/store";
import { gameById } from "@/lib/catalog";
import { utcDay } from "@/lib/rng";

export default function Page() {
  const s = useStore();
  const five = dailyFive(); const done = dailyDone(s);
  return (
    <div className="wrap"><section className="block">
      <div className="label">{utcDay()} · resets at 00:00 UTC</div>
      <h1>Daily Five</h1>
      <p className="muted">Five games from the date seed. Finish 1 for +10 HP, 3 for +30 HP, all 5 for +100 HP. Everyone gets the same five.</p>
      <div className="bar" style={{ margin: "16px 0" }}><i style={{ width: `${(done.length / 5) * 100}%` }} /></div>
      <div className="grid g3">
        {five.map((id, i) => { const g = gameById(id)!; const ok = done.includes(id); return (
          <Link key={id} href={`/games/${id}`} className="gamecard" style={ok ? { borderColor: "var(--bronze)" } : undefined}>
            <span className="num">{i + 1} OF 5 · {g.category.toUpperCase()}</span><h3 style={{ margin: 0 }}>{g.name}</h3><span className="muted">{g.tagline}</span>
            <span className="mono">{ok ? "✓ Done today" : `~${g.minutes} min`}</span></Link>); })}
      </div>
      <p className="note">Streak: {streakOf(s)} days. A day counts with 3 or more ranked runs. You get one free pause every week, and the streak survives the season break.</p>
    </section></div>
  );
}
