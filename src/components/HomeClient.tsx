"use client";
import Link from "next/link";
import { dailyDone, dailyFive, levelProgressOf, streakOf, totalHp, useStore } from "@/lib/store";
import { gameById } from "@/lib/catalog";
import { GameIcon } from "./GameIcon";
import { nextTier, tierFor } from "@/lib/points";
import { useMounted } from "@/lib/useMounted";

export function Home() {
  const mounted = useMounted();
  if (!mounted) return <section className="block" style={{ minHeight: 320 }} />;
  return <HomeInner />;
}
function HomeInner() {
  const s = useStore();
  const hp = totalHp(s);
  const five = dailyFive(); const done = dailyDone(s);
  const lp = levelProgressOf(s);
  const nt = nextTier(hp);
  const st = streakOf(s);
  return (
    <section className="block today">
      <div>
        <h2>Today&apos;s Daily Five</h2>
        <p className="muted">{done.length === 5 ? "All five done. Come back tomorrow." : `${done.length} of 5 done. One game earns 10 HP, three earn 30, all five earn 100.`}</p>
        <ol className="five">
          {five.map((id, i) => { const g = gameById(id)!; const ok = done.includes(id); return (
            <li key={id}><Link href={`/games/${id}`} className={"fiverow" + (ok ? " done" : "")}>
              <span className="fivenum">{i + 1}</span><GameIcon id={id} size={40} /><span className="idxmain"><b>{g.name}</b><span className="idxtag">{g.tagline}</span></span>
              <span className="fivestate">{ok ? "Done" : `${g.minutes} min`}</span></Link></li>); })}
        </ol>
      </div>
      <aside className="you">
        <p className="yousentence">
          @{s.profile?.handle}, you are <b>{tierFor(hp).name}</b> at level <b>{lp.level}</b> with <b>{hp.toLocaleString()}</b> Hub Points{st > 0 ? <> and a <b>{st}-day</b> streak</> : null}.
        </p>
        <div className="bar" aria-label={`Level progress ${Math.round(lp.pct * 100)} percent`}><i style={{ width: `${lp.pct * 100}%` }} /></div>
        <p className="muted" style={{ marginTop: 8 }}>{nt ? `${(nt.from - hp).toLocaleString()} HP to ${nt.name}.` : "Top of the ladder."}</p>
        <Link className="btn alt" href="/card">See my card</Link>
      </aside>
    </section>
  );
}
