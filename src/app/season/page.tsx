"use client";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { Character, CAST } from "@/components/Cast";
import { BOSS, SEASON, WEEKS, bossPhase, seasonWeek } from "@/lib/season";
import { useStore } from "@/lib/store";
import { sampleMembers } from "@/lib/members";
import { useMemo } from "react";
import { useMounted } from "@/lib/useMounted";

export default function Page() {
  const mounted = useMounted();
  if (!mounted) return <div className="wrap"><section className="block"><h1>Season 0</h1></section></div>;
  return <SeasonInner />;
}
function SeasonInner() {
  const s = useStore();
  const { idx, week, inSeason, intermission } = seasonWeek();
  const community = useMemo(() => {
    // sample community damage grows with the season so the bar always has a story
    const day = Math.max(0, Math.min(55, (Date.now() - Date.parse(SEASON.start + "T00:00:00Z")) / 864e5));
    return Math.floor(sampleMembers().reduce((a, m) => a + Math.min(BOSS.hp * BOSS.memberCapPct, m.hp * 0.9), 0) * (0.2 + day / 120));
  }, []);
  const total = Math.min(BOSS.hp, community + (s.bossDmg ?? 0));
  const pct = total / BOSS.hp;
  const phase = bossPhase(pct);
  const cap = Math.floor(BOSS.hp * BOSS.memberCapPct);
  return (
    <div className="wrap"><section className="block">
      <PageHead kicker={`Season ${SEASON.id} · ${SEASON.name}`} title={intermission ? "Intermission" : `Week ${Math.min(8, Math.max(1, idx + 1))}: ${week.name}`} />
      <p className="muted" style={{ maxWidth: "60ch" }}>{inSeason || intermission ? week.note : `Season ${SEASON.id} begins ${SEASON.start}. Warm up in practice mode.`} Host: {week.host}.</p>

      <h2 style={{ marginTop: 32 }}>The eight weeks</h2>
      <div className="grid g4">
        {WEEKS.map((w, i) => (
          <div key={w.n} className={"week" + (i === idx ? " now" : i < idx ? " past" : "")}>
            <div className="mono">W{w.n} · {w.host}</div><b style={{ fontFamily: "var(--serif)" }}>{w.name}</b><div className="muted" style={{ fontSize: ".82rem" }}>{w.note}</div>
          </div>))}
      </div>

      <div className="panel dark contours" style={{ marginTop: 32 }}>
        <div className="row sp"><div><div className="label" style={{ color: "var(--gold)" }}>Boss · Glitch Hunt</div><h2 style={{ margin: "4px 0" }}>Phase: {phase.name}</h2></div><Character name="Glitch" size={84} /></div>
        <p style={{ color: "#DFD8D0" }}>{phase.text}</p>
        <div className="bossbar" aria-label={`Boss health ${Math.round((1 - pct) * 100)} percent`} role="img"><i style={{ width: `${(1 - pct) * 100}%` }} /></div>
        <div className="row sp mono" style={{ marginTop: 8, color: "var(--gold)" }}><span>{(BOSS.hp - total).toLocaleString()} HP left</span><span>You: {(s.bossDmg ?? 0).toLocaleString()} / {cap.toLocaleString()} (5% cap)</span></div>
        <p className="note" style={{ color: "#DFD8D0" }}>Every ranked run adds damage equal to its score divided by 10. One member can add at most 5% of the bar. Community damage is simulated until the hub has real members. <Link href="/games" style={{ color: "var(--gold)" }}>Pick a game and fight →</Link></p>
      </div>

      <h2 style={{ marginTop: 32 }}>The cast</h2>
      <div className="grid g4">
        {CAST.map((c) => <div key={c.name} className="panel" style={{ textAlign: "center" }}><div className="floaty" style={{ display: "grid", placeItems: "center" }}><Character name={c.name} size={88} /></div><b style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>{c.name}</b><div className="mono">{c.role}</div><div className="muted" style={{ fontSize: ".85rem" }}>{c.line}</div></div>)}
      </div>
    </section></div>
  );
}
