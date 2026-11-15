"use client";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PageHead } from "@/components/PageHead";
import { GAMES } from "@/lib/catalog";
import { sampleMembers } from "@/lib/members";
import { hashString, mulberry32 } from "@/lib/rng";
import { totalHp, useStore } from "@/lib/store";

const TABS = ["overall", "pick-place", "prism-bender", "servo", "prism-pop", "calibrate"];

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
  const unit = game === "overall" ? "HP" : (GAMES.find((g) => g.id === game)?.unit ?? "pts");
  const name = game === "overall" ? "Overall" : GAMES.find((g) => g.id === game)!.name;

  const sorted = useMemo(() => {
    let a: { handle: string; score: number }[];
    if (game === "overall") {
      a = members.map((m) => ({ handle: m.handle, score: m.hp }));
      a.push({ handle: me, score: totalHp(s) });
    } else {
      const g = GAMES.find((x) => x.id === game)!;
      a = members.map((m) => ({ handle: m.handle, score: Math.round(g.par * (0.15 + mulberry32(hashString(m.handle + game))() * 0.95)) }));
      if (shared) for (const r of shared) { const ix = a.findIndex((x) => x.handle === r.handle); if (ix >= 0) a[ix].score = Math.max(a[ix].score, r.score); else a.push(r); }
      const b = s.bests[game]; if (b !== undefined) { const ix = a.findIndex((x) => x.handle === me); if (ix >= 0) a[ix].score = Math.max(a[ix].score, b); else a.push({ handle: me, score: b }); }
    }
    return a.sort((x, y) => y.score - x.score);
  }, [game, members, s, me, shared]);

  const top = sorted[0]?.score || 1;
  const myIx = sorted.findIndex((r) => r.handle === me);
  const podium = [1, 0, 2].map((i) => ({ ...sorted[i], rank: i + 1 })).filter((p) => p.handle);
  const heights: Record<number, number> = { 1: 340, 2: 260, 3: 200 };
  const rows = sorted.slice(0, 10);
  const ahead = myIx > 0 ? sorted[myIx - 1] : null;
  const picked = TABS.includes(game);

  return (
    <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
      <PageHead kicker="Rankings · Season 0" title="The boards" aside={<p style={{ margin: 0, maxWidth: "36ch", color: "var(--soft)" }}>Sample members fill the boards until the community arrives. Pick a board and watch the podium rebuild.</p>} />

      <div role="group" aria-label="Choose a board" style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "28px 0 8px", alignItems: "center" }}>
        {TABS.map((t) => (
          <button key={t} type="button" className={"chip" + (game === t ? " on" : "")} aria-pressed={game === t} onClick={() => setGame(t)}>{t === "overall" ? "Overall" : GAMES.find((g) => g.id === t)!.name}</button>
        ))}
        <select aria-label="More boards" value={picked ? "" : game} onChange={(e) => e.target.value && setGame(e.target.value)} style={{ minHeight: 44 }}>
          <option value="">More games…</option>
          {GAMES.filter((g) => !TABS.includes(g.id)).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <section aria-label="Podium" key={game} style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-end", marginTop: 24 }}>
        <div className="podium">
          {podium.map((p, k) => (
            <div key={p.handle} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 10, height: "100%" }}>
              <Avatar handle={p.handle} size={76} />
              <div style={{ fontFamily: "var(--mono)", fontSize: 12 }}>@{p.handle}</div>
              <div className="pod" style={{ width: "100%", height: heights[p.rank] - 120, borderRadius: "16px 16px 0 0", padding: 16, boxSizing: "border-box", textAlign: "center", animationDelay: `${k * 120}ms`, ...(p.rank === 1 ? { background: "#202020", color: "#F4F1EC", border: "1px solid #B9986A" } : { background: "var(--cream)", color: "var(--ink)" }) }}>
                <div className="serif" style={{ font: "200 56px/1 var(--serif)", letterSpacing: "-.035em" }}>{p.rank}</div>
                <div className="label" style={{ opacity: .8, marginTop: 6 }}>{p.score.toLocaleString()} {unit}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="hpanel" style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div className="label bronze">Your rank</div>
          <div className="serif" style={{ font: "200 96px/1 var(--serif)", letterSpacing: "-.035em", margin: "8px 0" }}>{myIx >= 0 ? `#${myIx + 1}` : "–"}</div>
          <div style={{ fontSize: 14, color: "var(--soft)" }}>of {sorted.length.toLocaleString()} operators on {name}. {myIx > 0 && ahead ? `${(ahead.score - sorted[myIx].score).toLocaleString()} ${unit} to pass @${ahead.handle}.` : myIx === 0 ? "You lead this board." : "Play a ranked run to appear."}</div>
          <div style={{ height: 6, background: "var(--cream)", borderRadius: 9, overflow: "hidden", marginTop: 16 }}><div style={{ height: "100%", width: `${myIx >= 0 ? (sorted[myIx].score / top) * 100 : 0}%`, background: "var(--ink)" }} /></div>
        </div>
      </section>

      <section style={{ marginTop: 48 }}>
        <div style={{ borderTop: "1px solid var(--ink)" }}>
          {rows.map((r, i) => (
            <div key={r.handle} className="rw" style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 10px", borderBottom: "1px solid var(--line)", animationDelay: `${i * 40}ms`, background: r.handle === me ? "color-mix(in srgb, var(--cream) 70%, transparent)" : undefined }}>
              <span className="label bronze" style={{ width: 36 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ flex: "0 0 240px", maxWidth: "40%", fontFamily: "var(--mono)", fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis" }}>@{r.handle}</span>
              <span style={{ flex: 1, height: 6, background: "var(--cream)", borderRadius: 9, overflow: "hidden", display: "block" }}><span style={{ display: "block", height: "100%", width: `${(r.score / top) * 100}%`, background: r.handle === me ? "var(--bronze)" : "var(--ink)", transition: "width 720ms var(--ease)" }} /></span>
              <span className="serif" style={{ width: 110, textAlign: "end", font: "200 28px var(--serif)" }}>{r.score.toLocaleString()}</span>
            </div>
          ))}
          {myIx >= 10 && (
            <div className="rw" style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 10px", borderTop: "1px dashed var(--ink)", background: "color-mix(in srgb, var(--cream) 70%, transparent)" }}>
              <span className="label bronze" style={{ width: 36 }}>{myIx + 1}</span><span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 13.5 }}>@{me}</span><span className="serif" style={{ font: "200 28px var(--serif)" }}>{sorted[myIx].score.toLocaleString()}</span>
            </div>
          )}
        </div>
        <p className="label muted" style={{ marginTop: 16 }}>Names are placeholders. Hub Points are a community game score, not an official PrismaX reward.</p>
      </section>
    </div>
  );
}
