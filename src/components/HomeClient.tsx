"use client";
import Link from "next/link";
import { dailyDone, dailyFive, levelProgressOf, memberCard, streakOf, totalHp, useStore } from "@/lib/store";
import { gameById } from "@/lib/catalog";
import { CardView } from "./CardView";
import { nextTier, tierFor } from "@/lib/points";

export function Home() {
  const s = useStore();
  const hp = totalHp(s);
  const five = dailyFive(); const done = dailyDone(s);
  const lp = levelProgressOf(s);
  const nt = nextTier(hp);
  return (
    <section className="block" style={{ paddingTop: 8 }}>
      <div className="grid g2">
        <div className="panel">
          <div className="label">Daily Five · {done.length} of 5 done</div>
          <h3 style={{ marginTop: 6 }}>Five games, five minutes each</h3>
          <div className="bar" style={{ margin: "8px 0 14px" }}><i style={{ width: `${(done.length / 5) * 100}%` }} /></div>
          <div className="row">
            {five.map((id) => { const g = gameById(id)!; const ok = done.includes(id); return <Link key={id} href={`/games/${id}`} className={"chip" + (ok ? " on" : "")}>{ok ? "✓ " : ""}{g.name}</Link>; })}
          </div>
          <p className="note">1 game +10 HP · 3 games +30 HP · all 5 +100 HP. Hub Points are a community game score, not an official PrismaX reward.</p>
        </div>
        <div className="panel">
          <div className="label">You · @{s.profile?.handle ?? "…"}</div>
          <div className="row" style={{ alignItems: "flex-end", gap: 24 }}>
            <div><div className="stat">{hp.toLocaleString()}</div><div className="label">Hub Points</div></div>
            <div><div className="stat">{lp.level}</div><div className="label">Level</div></div>
            <div><div className="stat">{streakOf(s)}</div><div className="label">Day streak</div></div>
          </div>
          <div className="bar" style={{ margin: "14px 0 6px" }}><i style={{ width: `${lp.pct * 100}%` }} /></div>
          <div className="mono">Tier {tierFor(hp).roman} {tierFor(hp).name}{nt ? ` · ${(nt.from - hp).toLocaleString()} HP to ${nt.name}` : ""}</div>
          <div className="row" style={{ marginTop: 12 }}><Link className="btn alt" href="/card">View my card</Link></div>
        </div>
      </div>
      {s.profile && <div style={{ marginTop: 24, display: "none" }}><CardView data={memberCard(s)} /></div>}
    </section>
  );
}
