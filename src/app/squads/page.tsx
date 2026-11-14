"use client";
import { useMemo } from "react";
import { SQUADS } from "@/lib/catalog";
import { sampleMembers } from "@/lib/members";
import { warScore } from "@/lib/points";
import { weekKey, update, useStore, totalHp } from "@/lib/store";

export default function Page() {
  const s = useStore();
  const members = useMemo(() => sampleMembers(), []);
  const mine = s.profile?.squad ?? "GL";
  const weekStart = new Date(weekKey(Date.now())).getTime();
  const myWeek = s.ledger.filter((r) => r.ts >= weekStart && r.amount > 0).reduce((a, r) => a + r.amount, 0);
  const rows = SQUADS.map((q) => {
    const pts = members.filter((m) => m.squad === q.code).map((m) => Math.floor(m.hp / 12));
    if (q.code === mine) pts.push(myWeek);
    return { ...q, war: warScore(pts), n: pts.length };
  }).sort((a, b) => b.war - a.war);
  const max = rows[0].war || 1;
  return (
    <div className="wrap"><section className="block">
      <h1>Squads and the weekly war</h1>
      <p className="muted">Twelve regional teams and language homes. A squad&apos;s weekly score is the sum of its top 20 percent of members, so small squads can win and one star cannot carry a team.</p>
      <p className="note">You are in squad <b>{mine}</b>. Your week: {myWeek} HP. You can switch once at the start of a season.</p>
      <div className="grid g2" style={{ marginTop: 16 }}>
        {rows.map((q, i) => (
          <div key={q.code} className="panel" style={q.code === mine ? { borderColor: "var(--bronze)" } : undefined}>
            <div className="row sp"><div><span className="mono">#{i + 1}</span> <b style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>{q.code} · {q.name}</b><div className="muted" style={{ fontSize: ".85rem" }}>{q.lang} · {q.members.toLocaleString()} members</div></div>
              <button className="chip" disabled={q.code === mine} onClick={() => update((x) => ({ ...x, profile: x.profile && { ...x.profile, squad: q.code } }))}>{q.code === mine ? "Your squad" : "Join"}</button></div>
            <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${(q.war / max) * 100}%` }} /></div>
            <div className="mono" style={{ marginTop: 4 }}>War score {q.war.toLocaleString()}</div>
          </div>))}
      </div>
      <p className="note">Squads under 20 members merge into a Global sub squad for scoring only. The winning squad gets a crest glow on the wall for a week.</p>
      <p className="note">Total HP of yours: {totalHp(s).toLocaleString()}. Sample numbers stand in for the community until launch.</p>
    </section></div>
  );
}
