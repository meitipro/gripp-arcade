"use client";
import { useEffect, useMemo, useState } from "react";
import { BOSS, SEASON, WEEKS, bossPhase, seasonWeek } from "@/lib/season";
import { floorPath } from "@/lib/motifs";
import { sampleMembers } from "@/lib/members";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

/** Season and boss: always the dark world, like the canvas. The "test hit" is a demo and never touches your points. */
export default function Page() {
  const mounted = useMounted();
  useEffect(() => { document.body.dataset.dark = "1"; return () => { delete document.body.dataset.dark; }; }, []);
  if (!mounted) return <div className="wrap"><section className="block" style={{ minHeight: 600 }} /></div>;
  return <Inner />;
}

function Inner() {
  const s = useStore();
  const { idx } = seasonWeek();
  const floor = useMemo(() => floorPath(1440, 700, 16, 12), []);
  const community = useMemo(() => {
    const day = Math.max(0, Math.min(55, (Date.now() - Date.parse(SEASON.start + "T00:00:00Z")) / 864e5));
    return Math.floor(sampleMembers().reduce((a, m) => a + Math.min(BOSS.hp * BOSS.memberCapPct, m.hp * 0.9), 0) * (0.2 + day / 120));
  }, []);
  const [demo, setDemo] = useState(0);
  const [hit, setHit] = useState(false);
  const cap = Math.floor(BOSS.hp * BOSS.memberCapPct);
  const dmg = Math.min(BOSS.hp, community + (s.bossDmg ?? 0) + demo * 9920);
  const pct = dmg / BOSS.hp;
  const phase = bossPhase(pct);
  const cur = BOSS.phases.findIndex((p) => p === phase);
  const doHit = () => { setDemo((d) => d + 1); setHit(true); setTimeout(() => setHit(false), 340); };

  return (
    <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96, position: "relative" }}>
      <svg viewBox="0 0 1440 700" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 260, width: "100%", height: 700, pointerEvents: "none" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".2" /></svg>

      <div style={{ position: "relative" }}>
        <header className="pagehead" style={{ borderColor: "rgba(244,241,236,.3)" }}>
          <div>
            <div className="label bronze">Season {SEASON.id} · {SEASON.name} · {idx === 5 ? "Boss week" : `Week ${Math.min(8, Math.max(1, idx + 1))}`}</div>
            <h1>Glitch <i>Hunt</i></h1>
          </div>
          <div className="seasonstats">
            <div><div className="label gold">Phase</div><div className="serif">{phase.name}</div></div>
            <div><div className="label gold">Left</div><div className="serif">{Math.round((1 - pct) * 100)}%</div></div>
            <div><div className="label gold">You</div><div className="serif">{(s.bossDmg ?? 0).toLocaleString()}</div></div>
          </div>
        </header>

        <section aria-label="Boss arena" style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center", padding: "56px 0 24px" }}>
          <div className="fl" style={{ flex: "1 1 440px", display: "flex", justifyContent: "center" }}>
            <svg className={hit ? "hit" : "gl"} width="420" height="350" viewBox="0 0 180 150" role="img" aria-label="Glitch Prime, a robot face made of dropped frames" style={{ maxWidth: "100%", height: "auto" }}>
              <rect x="20" y="20" width="140" height="100" rx="26" fill="none" stroke="#F4F1EC" strokeWidth="2.2" strokeDasharray="18 6 4 6" />
              <rect x="52" y="52" width="22" height="30" rx="4" fill="#F4F1EC" /><rect x="106" y="56" width="22" height="22" fill="#B56654" />
              <path d="M4 66H40M140 86H178M60 100H120M30 30H70" stroke="#F4F1EC" strokeOpacity=".6" strokeWidth="1.6" />
              <path d="M66 130h48" stroke="#F4F1EC" strokeWidth="2.4" strokeDasharray="6 4" />
              <rect x={110 + (demo % 5) * 8} y="40" width="30" height="8" fill="#B9986A" opacity=".8" />
            </svg>
          </div>
          <div style={{ flex: "1 1 420px", minWidth: 0 }}>
            <p className="serif" style={{ font: "italic 200 30px/1.2 var(--serif)", margin: "0 0 8px" }}>&ldquo;p...ick. m...e.&rdquo;</p>
            <p style={{ margin: "0 0 28px", color: "rgba(244,241,236,.7)", maxWidth: "40ch" }}>{phase.text}</p>
            <div role="img" aria-label={`Boss health ${Math.round((1 - pct) * 100)} percent`} style={{ height: 34, border: "1px solid rgba(244,241,236,.5)", borderRadius: 999, padding: 4 }}>
              <div style={{ height: "100%", width: `${((1 - pct) * 100).toFixed(1)}%`, minWidth: 4, borderRadius: 999, background: "repeating-linear-gradient(135deg, #B56654 0 10px, #9a5545 10px 20px)", transition: "width 480ms var(--ease)" }} />
            </div>
            <div className="label between" style={{ marginTop: 12, color: "rgba(244,241,236,.75)" }}><span>{(BOSS.hp - dmg).toLocaleString()} HP left</span><span>Cap {cap.toLocaleString()} per member</span></div>
            <div className="row" style={{ marginTop: 32, gap: 12 }}>
              <button type="button" className="btn paperbtn" style={{ minHeight: 56, padding: "0 32px" }} onClick={doHit}>Test hit (demo)</button>
              <button type="button" className="btn alt" style={{ minHeight: 56, color: "#F4F1EC", borderColor: "rgba(244,241,236,.5)" }} onClick={() => setDemo(0)}>Reset</button>
            </div>
            <p style={{ margin: "18px 0 0", fontSize: 13, color: "rgba(244,241,236,.6)" }}>The test hit only moves this bar for you to see. Real damage comes from ranked runs: each deals its score divided by 10, and community damage is simulated until the hub has members.</p>
          </div>
        </section>

        <section style={{ paddingTop: 56 }}>
          <div className="label gold" style={{ marginBottom: 16 }}>Four phases · the hub itself changes</div>
          <div className="phases4">
            {BOSS.phases.map((p, i) => (
              <div key={p.name} style={{ padding: "20px 24px 22px 0", borderInlineEnd: "1px solid rgba(244,241,236,.14)", opacity: i === cur ? 1 : 0.55 }}>
                <div className="label" style={{ color: i === cur ? "#d17f6b" : "#B9986A" }}>From {Math.round(p.at * 100)}% damage</div>
                <div className="serif" style={{ font: "200 36px/1 var(--serif)", margin: "14px 0 8px" }}>{p.name}</div>
                <div style={{ fontSize: 14, color: "rgba(244,241,236,.7)" }}>{p.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingTop: 72 }}>
          <div className="between" style={{ marginBottom: 20 }}><h2 className="disp2" style={{ margin: 0, fontSize: 56 }}>The eight <i>weeks</i></h2><span className="label" style={{ color: "rgba(244,241,236,.6)" }}>Season 0 · Nov 9 to Jan 3</span></div>
          <div className="weeks8">
            {WEEKS.map((w, i) => (
              <div key={w.n} className="wk" style={{ borderColor: i === idx || i === 5 ? "#B9986A" : "rgba(244,241,236,.18)", background: i === idx ? "rgba(185,152,106,.14)" : i === 5 ? "rgba(185,152,106,.08)" : "#1c1c1b" }}>
                <div className="label between" style={{ color: "#B9986A" }}><span>W{w.n}{i === idx ? " · now" : ""}</span><span>{w.host}</span></div>
                <div className="serif" style={{ font: "200 30px/1.05 var(--serif)", margin: "14px 0 10px" }}>{w.name}</div>
                <div style={{ fontSize: 13.5, color: "rgba(244,241,236,.7)" }}>{w.note}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
