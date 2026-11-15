"use client";
import { PageHead } from "@/components/PageHead";
import { GAMES } from "@/lib/catalog";
import { dayCounts, levelProgressOf, statsOf, streakOf, totalHp, totalXp, useStore } from "@/lib/store";
import { nextTier, tierFor } from "@/lib/points";
import { useMounted } from "@/lib/useMounted";

function Heat({ counts }: { counts: Record<string, number> }) {
  const days: string[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) { const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i)); days.push(d.toISOString().slice(0, 10)); }
  const shade = (n: number) => (n >= 5 ? "#B56654" : n >= 3 ? "#B9986A" : n >= 1 ? "#DFD8D0" : "#efebe5");
  return (
    <div role="img" aria-label="Activity over the last twelve weeks" style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 14px)", gap: 3, overflowX: "auto", paddingBottom: 4 }}>
      {days.map((d) => <div key={d} title={`${d}: ${counts[d] ?? 0} ranked runs`} style={{ width: 14, height: 14, borderRadius: 3, background: shade(counts[d] ?? 0) }} />)}
    </div>
  );
}

export default function Page() {
  const mounted = useMounted();
  if (!mounted) return <div className="wrap"><section className="block"><PageHead kicker="Operator" title="My progress" /></section></div>;
  return <Inner />;
}
function Inner() {
  const s = useStore();
  const hp = totalHp(s), lp = levelProgressOf(s), st = statsOf(s), nt = nextTier(hp);
  const ranked = s.runs.filter((r) => r.ranked);
  return (
    <div className="wrap"><section className="block">
      <PageHead kicker="Operator" title="My progress" />
      <div className="grid g4">
        <div className="panel"><div className="stat">{hp.toLocaleString()}</div><div className="label">Hub Points</div></div>
        <div className="panel"><div className="stat">{totalXp(s).toLocaleString()}</div><div className="label">XP · level {lp.level}</div></div>
        <div className="panel"><div className="stat">{streakOf(s)}</div><div className="label">Day streak</div></div>
        <div className="panel"><div className="stat">{ranked.length}</div><div className="label">Ranked runs</div></div>
      </div>
      <p className="note">Tier {tierFor(hp).roman} {tierFor(hp).name}{nt ? ` · ${(nt.from - hp).toLocaleString()} HP to ${nt.name}` : ""}. Level progress {Math.round(lp.pct * 100)}%.</p>
      <div className="bar" style={{ marginBottom: 24 }}><i style={{ width: `${lp.pct * 100}%` }} /></div>

      <h2>Last twelve weeks</h2>
      <div className="panel"><Heat counts={dayCounts(s)} /><p className="note">Darker means more ranked runs. A day with 3 or more keeps your streak.</p></div>

      <h2 style={{ marginTop: 32 }}>Play style</h2>
      <div className="grid g4">{Object.entries(st).map(([k, v]) => <div key={k} className="panel"><div className="label">{k}</div><div className="stat">{v}</div><div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${v}%` }} /></div></div>)}</div>

      <h2 style={{ marginTop: 32 }}>Personal bests</h2>
      <div className="panel"><table className="t"><thead><tr><th>Game</th><th style={{ textAlign: "end" }}>Best</th><th style={{ textAlign: "end" }}>Excellent at</th></tr></thead><tbody>
        {GAMES.map((g) => <tr key={g.id}><td><a href={`/games/${g.id}`}>{g.name}</a></td><td style={{ textAlign: "end" }} className="mono">{s.bests[g.id] !== undefined ? s.bests[g.id].toLocaleString() : "–"}</td><td style={{ textAlign: "end" }} className="mono">{g.par.toLocaleString()}</td></tr>)}
      </tbody></table></div>

      <h2 style={{ marginTop: 32 }}>Recent runs</h2>
      <div className="panel"><table className="t"><tbody>
        {s.runs.slice(0, 15).map((r) => <tr key={r.id}><td>{GAMES.find((g) => g.id === r.game)?.name}{r.ranked ? "" : " (practice)"}</td><td className="mono">{r.score.toLocaleString()}</td><td className="mono">+{r.hp} HP</td><td className="muted">{new Date(r.ts).toLocaleDateString()}</td></tr>)}
        {!s.runs.length && <tr><td className="muted">No runs yet. Play something!</td></tr>}
      </tbody></table></div>
    </section></div>
  );
}
