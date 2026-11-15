"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Avatar } from "@/components/Avatar";
import { Character } from "@/components/Cast";
import { gameById, QUESTS } from "@/lib/catalog";
import { nextTier, tierFor } from "@/lib/points";
import { sampleMembers } from "@/lib/members";
import { floorPath } from "@/lib/motifs";
import { BOSS } from "@/lib/season";
import { utcDay } from "@/lib/rng";
import { dailyDone, dailyFive, levelProgressOf, questStatus, rankedOn, streakOf, totalHp, useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

const SHAPES = ["M4 4h18v18H4z", "M13 3a10 10 0 1 0 .01 0z", "M13 3l10 19H3z", "M13 2l11 11-11 11L2 13z"];
const FILL = ["#F4F1EC", "#B56654", "#B9986A", "#F4F1EC"], STROKE = ["#F4F1EC", "#B56654", "#B9986A", "rgba(244,241,236,.55)"];

export default function Page() {
  const mounted = useMounted();
  if (!mounted) return <div className="wrap"><section className="block" style={{ minHeight: 600 }} /></div>;
  return <Dashboard />;
}

function Dashboard() {
  const s = useStore();
  const hp = totalHp(s), five = dailyFive(), done = dailyDone(s), st = streakOf(s), lp = levelProgressOf(s), nt = nextTier(hp);
  const today = rankedOn(s, utcDay());
  const members = useMemo(() => sampleMembers(), []);
  const rank = useMemo(() => 1 + members.filter((m) => m.hp > hp).length, [members, hp]);
  const floor = useMemo(() => floorPath(640, 220, 8, 10), []);
  const pop = useMemo(() => { let x = 42; const r = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; return Array.from({ length: 40 }, () => { const k = Math.floor(r() * 4); return { k, lit: r() < 0.18 }; }); }, []);
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const mins = (() => { const n = new Date(); const t = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1)); const d = Math.floor((t.getTime() - n.getTime()) / 60000); return `${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`; })();
  const featId = ["prism-pop", "pick-place", "prism-bender", "tabletop-tower", "lag-lab"][new Date().getUTCDate() % 5];
  const feat = gameById(featId)!;
  const dayStreak = Array.from({ length: 14 }, (_, i) => (i < Math.min(14, st) ? 1 : i === Math.min(13, st) ? 2 : 0));
  const circ = 2 * Math.PI * 23;
  const quests = QUESTS.filter((q) => q.cycle !== "Season").slice(0, 3).map((q) => ({ q, ...questStatus(s, q.id) }));
  const faces = members.slice(0, 10).map((m) => m.handle);
  const bossLeft = Math.max(0, BOSS.hp - (s.bossDmg ?? 0) - 700_000);
  const bossPct = Math.min(100, Math.round(((BOSS.hp - bossLeft) / BOSS.hp) * 100));

  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="homehead">
        <div>
          <div className="label muted">{new Date().toLocaleDateString("en-US", { weekday: "long" })}, {part} · Season 0, week 1</div>
          <h1>Welcome back,<br /><i>{s.profile?.handle ?? "operator"}</i></h1>
        </div>
        <div className="hstats">
          <div><div className="label muted">Rank</div><div className="serif">#{rank}</div></div>
          <div><div className="label muted">Streak</div><div className="serif">{st}<small> days</small></div></div>
          <div className="today"><div className="label">Today</div><div className="serif">{done.length}<small> / 5</small></div></div>
        </div>
      </div>

      <div className="hcols">
        <section aria-label="Daily Five" className="hcol1 hpanel">
          <div className="between" style={{ alignItems: "center" }}>
            <h2 className="disp3" style={{ fontSize: 34 }}>Daily <i>Five</i></h2>
            <svg width="56" height="56" viewBox="0 0 56 56" role="img" aria-label={`${done.length} of 5 done`}>
              <circle cx="28" cy="28" r="23" fill="none" stroke="var(--cream)" strokeWidth="5" />
              <circle cx="28" cy="28" r="23" fill="none" stroke="var(--ink)" strokeWidth="5" strokeDasharray={`${(circ * done.length) / 5} ${circ}`} strokeLinecap="round" transform="rotate(-90 28 28)" />
              <text x="28" y="33" textAnchor="middle" fontFamily="var(--serif)" fontSize="17" fill="var(--ink)">{done.length}/5</text>
            </svg>
          </div>
          <p className="muted" style={{ margin: "6px 0 18px", fontSize: 13 }}>Resets in {mins}. Same seeds for everyone.</p>
          <div style={{ borderTop: "1px solid var(--ink)" }}>
            {five.map((id) => {
              const g = gameById(id)!; const best = today.filter((r) => r.game === id).reduce((a, r) => Math.max(a, r.score), 0); const ok = done.includes(id);
              return (
                <Link key={id} href={`/games/${id}`} className="hrow">
                  <span className="label muted" style={{ width: 58, fontSize: 10 }}>{g.category}</span>
                  <span className="serif">{g.name}</span>
                  {ok ? <span className="label muted" style={{ fontSize: 10 }}>✓ {best.toLocaleString()}</span> : <span className="label" style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: 999, padding: "7px 14px", fontSize: 10 }}>Play</span>}
                </Link>
              );
            })}
          </div>
          <div className="streakrow">{dayStreak.map((k, i) => <i key={i} style={k === 1 ? { background: "var(--ink)" } : k === 2 ? { border: "1.5px dashed var(--bronze)" } : { border: "1px solid var(--line)" }} />)}</div>
          <p className="muted" style={{ margin: "10px 0 0", fontSize: 13 }}>One free pause left this week.</p>
        </section>

        <div className="hcol2">
          <Link href={`/games/${feat.id}`} className="featbox">
            <svg viewBox="0 0 640 220" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "60%" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".22" /></svg>
            <div className="label" style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "18px 22px", color: "#B9986A", borderBottom: "1px solid rgba(244,241,236,.12)" }}><span>{feat.category}</span><span>{feat.minutes} min</span><span>{s.bests[feat.id] !== undefined ? `Best ${s.bests[feat.id].toLocaleString()}` : "New for you"}</span></div>
            <div style={{ position: "relative", padding: "28px 22px 10px", display: "flex", justifyContent: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 34px)", gap: 6 }}>
                {pop.map((p, i) => <span key={i} style={{ width: 34, height: 34, display: "grid", placeItems: "center" }}><svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d={SHAPES[p.k]} fill={p.lit ? FILL[p.k] : "none"} stroke={STROKE[p.k]} strokeWidth="2" /></svg></span>)}
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "18px 22px 22px", flexWrap: "wrap", gap: 16 }}>
              <div><div className="label" style={{ color: "rgba(244,241,236,.6)" }}>Featured this week</div><div className="serif" style={{ fontSize: 52, lineHeight: 1, fontWeight: 200, letterSpacing: "-.03em" }}>{feat.name.includes(" ") ? <>{feat.name.slice(0, feat.name.lastIndexOf(" ") + 1)}<i>{feat.name.slice(feat.name.lastIndexOf(" ") + 1)}</i></> : <i>{feat.name}</i>}</div></div>
              <span className="label" style={{ background: "#F4F1EC", color: "#202020", borderRadius: 999, padding: "0 24px", minHeight: 48, display: "inline-flex", alignItems: "center" }}>Play now</span>
            </div>
          </Link>

          <section aria-label="Quests">
            <div className="between" style={{ marginBottom: 12 }}><h2 className="disp3" style={{ fontSize: 34 }}>Quests</h2><span className="label muted">Refresh Monday</span></div>
            <div style={{ borderTop: "1px solid var(--ink)" }}>
              {quests.map(({ q, done: d, progress }) => (
                <div key={q.id} className="questrow">
                  <span style={{ flex: "1 1 220px", fontSize: 16 }}>{q.goal}</span>
                  <span className="qbar"><span style={{ display: "block", height: "100%", width: d ? "100%" : `${Math.min(100, (parseInt(progress) / Math.max(1, parseInt(progress.split("/")[1] ?? "1"))) * 100 || 0)}%`, background: d ? "var(--bronze)" : "var(--ink)" }} /></span>
                  <span className="label muted" style={{ width: 64 }}>{d ? "Done" : progress}</span>
                  <span className="label" style={{ width: 64, textAlign: "end", color: "var(--bronze)" }}>+{q.hp} HP</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="hcol3">
          <div style={{ border: "1px solid var(--ink)", borderRadius: 16, padding: 22 }}>
            <div className="label muted">Season 0 · Hub points</div>
            <div className="serif" style={{ font: "200 64px/1 var(--serif)", letterSpacing: "-.035em", margin: "8px 0 14px" }}>{hp.toLocaleString()}</div>
            <div className="bar" style={{ height: 6, borderRadius: 9 }}><i style={{ width: `${lp.pct * 100}%`, background: "var(--ink)", borderRadius: 9 }} /></div>
            <div className="between muted" style={{ marginTop: 10, fontSize: 13 }}><span>Tier {tierFor(hp).roman} · {tierFor(hp).name}</span><span>{nt ? `${nt.name} at ${nt.from.toLocaleString()}` : "Top tier"}</span></div>
          </div>
          <div style={{ background: "#202020", color: "#F4F1EC", borderRadius: 16, padding: 22 }}>
            <div className="label between" style={{ color: "#B9986A" }}><span>Community boss</span><span>Sundays</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0" }}>
              <svg width="64" height="54" viewBox="0 0 180 150" aria-hidden="true"><rect x="20" y="20" width="140" height="100" rx="26" fill="none" stroke="#F4F1EC" strokeWidth="6" strokeDasharray="18 6 4 6" /><rect x="52" y="52" width="22" height="30" rx="4" fill="#F4F1EC" /><rect x="106" y="56" width="22" height="22" fill="#B56654" /></svg>
              <div className="serif" style={{ font: "200 34px/1 var(--serif)", letterSpacing: "-.03em" }}>Glitch <i>Prime</i></div>
            </div>
            <div style={{ height: 14, border: "1px solid rgba(244,241,236,.4)", borderRadius: 999, padding: 2 }}><div style={{ height: "100%", width: `${100 - bossPct}%`, borderRadius: 999, background: "repeating-linear-gradient(135deg, #B56654 0 6px, #9a5545 6px 12px)" }} /></div>
            <div className="label" style={{ marginTop: 10, color: "rgba(244,241,236,.7)" }}>{bossLeft.toLocaleString()} / {BOSS.hp.toLocaleString()} HP · You dealt {(s.bossDmg ?? 0).toLocaleString()}</div>
          </div>
          <div className="hpanel">
            <div className="label muted" style={{ marginBottom: 14 }}>On the wall now</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>{faces.map((h) => <Avatar key={h} handle={h} size={56} />)}</div>
            <p className="muted" style={{ margin: "14px 0 0", fontSize: 13 }}>Sample faces. Real members appear once the hub is live.</p>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", padding: "4px 4px 0" }}>
            <Character name="Gripp" size={56} />
            <p className="serif" style={{ margin: 0, font: "italic 200 20px/1.25 var(--serif)", color: "var(--soft)" }}>&ldquo;{5 - done.length > 0 ? `${5 - done.length} left. ${done.length < 5 ? "Pixel Wall is a quick one." : ""}` : "All five done. Nicely calibrated."}&rdquo;</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
