"use client";
import { PageHead } from "@/components/PageHead";
import Link from "next/link";
import { dailyDone, dailyFive, streakOf, useStore } from "@/lib/store";
import { gameById } from "@/lib/catalog";
import { utcDay } from "@/lib/rng";
import { GameIcon } from "@/components/GameIcon";
import { useMounted } from "@/lib/useMounted";

export default function Page() {
  const mounted = useMounted();
  if (!mounted) return <div className="wrap"><section className="block"><PageHead kicker="Every day at 00:00 UTC" title="Daily Five" /></section></div>;
  return <DailyInner />;
}
function DailyInner() {
  const s = useStore();
  const five = dailyFive(); const done = dailyDone(s);
  return (
    <div className="wrap"><section className="block">
      <PageHead kicker="Every day at 00:00 UTC" title="Daily Five" />
      <p className="muted">{utcDay()} UTC, resets at midnight. Five games from the date seed. Finish 1 for +10 HP, 3 for +30 HP, all 5 for +100 HP. Everyone gets the same five.</p>
      <div className="bar" style={{ margin: "16px 0" }}><i style={{ width: `${(done.length / 5) * 100}%` }} /></div>
      <ol className="five">
        {five.map((id, i) => { const g = gameById(id)!; const ok = done.includes(id); return (
          <li key={id}><Link href={`/games/${id}`} className={"fiverow" + (ok ? " done" : "")}>
            <span className="fivenum">{i + 1}</span><GameIcon id={id} size={56} /><span className="idxmain"><b>{g.name}</b><span className="idxtag">{g.category} · {g.tagline}</span></span>
            <span className="fivestate">{ok ? "Done today" : `~${g.minutes} min`}</span></Link></li>); })}
      </ol>
      <p className="note">Streak: {streakOf(s)} days. A day counts with 3 or more ranked runs. You get one free pause every week, and the streak survives the season break.</p>
    </section></div>
  );
}
