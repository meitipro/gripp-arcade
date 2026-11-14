"use client";
import { useEffect, useMemo, useState } from "react";
import { GAMES } from "@/lib/catalog";
import { sampleMembers } from "@/lib/members";
import { hashString, mulberry32 } from "@/lib/rng";
import { totalHp, useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";

export default function Page() {
  const s = useStore();
  const [game, setGame] = useState<string>("overall");
  const [shared, setShared] = useState<{ handle: string; score: number }[] | null>(null);
  const members = useMemo(() => sampleMembers(), []);
  useEffect(() => {
    setShared(null);
    if (game === "overall") return;
    fetch(`/api/boards?game=${game}`).then((r) => r.json()).then((j) => { if (j.shared) setShared(j.rows); }).catch(() => {});
  }, [game]);
  const me = s.profile?.handle ?? "you";
  const rows = useMemo(() => {
    if (game === "overall") {
      const a = members.map((m) => ({ handle: m.handle, score: m.hp }));
      a.push({ handle: me, score: totalHp(s) }); return a;
    }
    const g = GAMES.find((x) => x.id === game)!;
    const a = members.map((m) => ({ handle: m.handle, score: Math.round(g.par * (0.15 + mulberry32(hashString(m.handle + game))() * 0.95)) }));
    if (shared) for (const r of shared) { const ix = a.findIndex((x) => x.handle === r.handle); if (ix >= 0) a[ix].score = Math.max(a[ix].score, r.score); else a.push(r); }
    const b = s.bests[game]; if (b !== undefined) { const ix = a.findIndex((x) => x.handle === me); if (ix >= 0) a[ix].score = Math.max(a[ix].score, b); else a.push({ handle: me, score: b }); }
    return a;
  }, [game, members, s, me, shared]);
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex((r) => r.handle === me) + 1;
  return (
    <div className="wrap"><section className="block">
      <h1>Boards</h1>
      <p className="muted">Sample community members fill the boards until the community arrives. {shared ? "Showing shared scores too." : "Your scores are local to this device unless the host enables shared boards."}</p>
      <label className="label" htmlFor="g">Board</label><br />
      <select id="g" value={game} onChange={(e) => setGame(e.target.value)} style={{ margin: "6px 0 16px" }}>
        <option value="overall">Overall · lifetime Hub Points</option>
        {GAMES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <div className="panel">
        <div className="label">{myRank ? `Your rank: #${myRank} of ${sorted.length}` : "Play a ranked run to appear"}</div>
        <table className="t"><thead><tr><th>#</th><th>Operator</th><th style={{ textAlign: "end" }}>{game === "overall" ? "HP" : "Best"}</th></tr></thead>
          <tbody>{sorted.slice(0, 25).map((r, i) => (
            <tr key={r.handle} style={r.handle === me ? { background: "rgba(181,102,84,.12)" } : undefined}>
              <td>{i + 1}</td><td><span className="row" style={{ gap: 8 }}><Avatar handle={r.handle} size={28} round />@{r.handle}</span></td><td style={{ textAlign: "end" }} className="mono">{r.score.toLocaleString()}</td></tr>))}</tbody></table>
        <p className="note">Hub Points are a community game score, not an official PrismaX reward. Names shown are placeholders, not real people.</p>
      </div>
    </section></div>
  );
}
