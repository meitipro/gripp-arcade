"use client";
import { PageHead } from "@/components/PageHead";
import { BADGES, QUESTS } from "@/lib/catalog";
import { questStatus, useStore } from "@/lib/store";

export default function Page() {
  const s = useStore();
  return (
    <div className="wrap"><section className="block">
      <PageHead kicker="Collect" title="Quests and badges" />
      <p className="muted">Quests give gentle direction. Rewards are paid automatically after the run that completes them.</p>
      {(["Daily", "Weekly", "Season"] as const).map((c) => (
        <div key={c} style={{ margin: "24px 0" }}>
          <h2>{c}</h2>
          <div className="grid g3">
            {QUESTS.filter((q) => q.cycle === c).map((q) => { const st = questStatus(s, q.id); return (
              <div key={q.id} className="panel" style={st.done ? { borderColor: "var(--bronze)" } : undefined}>
                <div className="label">{q.level} · {q.hp} HP</div><h3 style={{ margin: "4px 0" }}>{q.name}</h3><div className="muted">{q.goal}</div>
                <div className="mono" style={{ marginTop: 8 }}>{st.done ? "✓ Complete" : st.progress}</div></div>); })}
          </div>
        </div>))}
      <h2>Badges</h2>
      <div className="grid g4">{BADGES.map((b) => { const has = s.badges.includes(b.id); return <div key={b.id} className="panel" style={{ opacity: has ? 1 : 0.75 }}><b>{b.name}</b><div className="muted" style={{ fontSize: ".85rem" }}>{b.desc}</div><div className="mono">{has ? "Earned" : "Locked"}</div></div>; })}</div>
      <p className="note">Hub Points are a community game score, not an official PrismaX reward.</p>
    </section></div>
  );
}
