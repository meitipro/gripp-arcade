"use client";
import { useMemo, useState } from "react";
import { SQUADS } from "@/lib/catalog";
import { cleanHandle } from "@/lib/card";
import { contourPath, floorPath } from "@/lib/motifs";
import { update, useStore } from "@/lib/store";
import { Avatar } from "./Avatar";

const SUGGEST = ["mira.ops", "kian_grip", "servo_sara", "pixelpari", "nav.teleop", "lumi_lab", "tara_tick", "zed_zero"];
const STEPS = [
  { t: "Welcome, operator", b: "No password, no email, no wallet. Your progress lives on this device, and you can delete it any time from Settings.", cta: "Let's set up" },
  { t: "Pick a name and a face", b: "A robot face is drawn from your handle. Photos from Discord or X come later, and only if you opt in.", cta: "Looks good" },
  { t: "Join a squad", b: "Suggested from your language. Member counts are shown so a small squad is a choice, not a surprise.", cta: "Join this squad" },
  { t: "Claim your card", b: "Your first card is empty on purpose. Every run fills it in.", cta: "Start playing" },
] as const;

/** Four steps, same layout as the design canvas. Everything is local; nothing leaves this device. */
export default function Onboarding() {
  const s = useStore();
  const p = s.profile!;
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState(p.handle);
  const [squad, setSquad] = useState(p.squad);
  const [loc, setLoc] = useState<"en" | "fa">(p.locale);
  const [err, setErr] = useState("");
  const bg = useMemo(() => contourPath(300, 300, 18, 16, 20, 5.1, 1.3) + contourPath(1200, 760, 16, 14, 22, 2.2, 1.3), []);
  const floor = useMemo(() => floorPath(400, 460, 8, 8), []);
  const shown = squad ? SQUADS.slice(0, 12) : SQUADS;
  const sq = SQUADS.find((q) => q.code === squad) ?? SQUADS[1];
  const finish = () => {
    const h = cleanHandle(handle);
    if (h.length < 2) { setStep(2); return setErr("2 to 24 letters, numbers, dot, dash or underscore"); }
    update((x) => ({ ...x, profile: x.profile && { ...x.profile, handle: h, squad, locale: loc, onboarded: true } }));
  };
  const next = () => { if (step === 2 && cleanHandle(handle).length < 2) return setErr("2 to 24 letters, numbers, dot, dash or underscore"); setErr(""); if (step === 4) finish(); else setStep(step + 1); };
  const T = STEPS[step - 1];
  const hh = cleanHandle(handle) || p.handle;

  return (
    <div className="onbg" role="dialog" aria-modal="true" aria-label="Welcome">
      <svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}><path d={bg} fill="none" stroke="#7A6B5A" strokeOpacity=".16" /></svg>
      <div style={{ position: "relative", width: "100%", maxWidth: 980, margin: "auto" }}>
        <div className="between" style={{ marginBottom: 20, alignItems: "center" }}>
          <div className="serif" style={{ font: "300 28px var(--serif)" }}>Gripp <i>Arcade</i></div>
          <div style={{ display: "flex", gap: 8 }} aria-label={`Step ${step} of 4`}>{[1, 2, 3, 4].map((n) => <i key={n} style={{ display: "block", width: n === step ? 36 : 12, height: 6, borderRadius: 9, transition: "width .22s", background: n <= step ? "#202020" : "rgba(32,32,32,.25)" }} />)}</div>
        </div>
        <div className="onpanel">
          <div style={{ flex: "1 1 380px", padding: "44px 44px 36px", display: "flex", flexDirection: "column" }}>
            <div className="label bronze">Step {step} of 4</div>
            <h2 className="serif" style={{ margin: "14px 0 12px", font: "200 56px/.98 var(--serif)", letterSpacing: "-.035em" }}>{T.t}</h2>
            <p style={{ margin: "0 0 24px", color: "#4a4038", maxWidth: "38ch" }}>{T.b}</p>

            {step === 1 && (
              <div style={{ border: "1px solid rgba(32,32,32,.16)", borderRadius: 14, padding: "16px 18px", background: "#FBF9F6", display: "grid", gap: 8, fontSize: 14, color: "#202020" }}>
                <div className="label" style={{ color: "#7A6B5A" }}>What this stores</div>
                <div>✓ Your handle, squad and language</div><div>✓ Your runs, points and bests</div><div style={{ color: "#7A6B5A" }}>✕ No email, location or device fingerprint. Nothing is posted anywhere.</div>
              </div>
            )}
            {step === 2 && (
              <>
                <label className="label" htmlFor="ob-h" style={{ color: "#202020" }}>Handle</label>
                <input id="ob-h" type="text" maxLength={24} value={handle} onChange={(e) => setHandle(e.target.value)} style={{ margin: "4px 0 12px", maxWidth: 360, background: "#FBF9F6", color: "#202020" }} />
                <div className="row" style={{ gap: 8 }}>
                  {SUGGEST.slice(0, 5).map((h) => <button key={h} type="button" className="chip" style={{ color: "#202020", borderColor: "#202020", minHeight: 38 }} onClick={() => setHandle(h)}>{h}</button>)}
                </div>
                <div className="row" style={{ marginTop: 14, gap: 10 }}>
                  <span className="label" style={{ border: "2px solid #202020", borderRadius: 16, padding: "10px 14px", background: "#202020", color: "#F4F1EC" }}>Robot</span>
                  <span className="label muted" style={{ border: "1px dashed rgba(32,32,32,.4)", borderRadius: 16, padding: "10px 14px" }}>Discord · later</span>
                  <span className="label muted" style={{ border: "1px dashed rgba(32,32,32,.4)", borderRadius: 16, padding: "10px 14px" }}>X · later</span>
                </div>
                <label className="label" htmlFor="ob-l" style={{ color: "#202020", marginTop: 16 }}>Language</label>
                <select id="ob-l" value={loc} onChange={(e) => setLoc(e.target.value as "en" | "fa")} style={{ maxWidth: 220, background: "#FBF9F6", color: "#202020" }}><option value="en">English</option><option value="fa">فارسی</option></select>
                {err && <p className="note" role="alert" style={{ color: "#9a5545" }}>{err}</p>}
              </>
            )}
            {step === 3 && (
              <div style={{ borderTop: "1px solid #202020", maxHeight: 280, overflow: "auto" }}>
                {shown.slice(0, 6).map((q) => (
                  <button key={q.code} type="button" aria-pressed={squad === q.code} onClick={() => setSquad(q.code)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, padding: "0 10px", border: 0, borderBottom: "1px solid rgba(32,32,32,.16)", cursor: "pointer", fontFamily: "inherit", color: "#202020", background: squad === q.code ? "#ECE7E0" : "transparent" }}>
                    <span className="label" style={{ width: 32, textAlign: "start" }}>{q.code}</span><span style={{ flex: 1, textAlign: "start", font: "200 22px var(--serif)" }}>{q.name}</span><span className="label" style={{ color: "#7A6B5A" }}>{q.members.toLocaleString()} members</span>
                  </button>
                ))}
              </div>
            )}
            {step === 4 && <div className="label" style={{ color: "#7A6B5A", lineHeight: 2 }}>An empty tier I card appears.<br />Your first run fills the stats.</div>}

            <div style={{ marginTop: "auto", paddingTop: 32, display: "flex", gap: 10, alignItems: "center" }}>
              {step > 1 && <button type="button" className="btn alt" style={{ color: "#202020", borderColor: "#202020" }} onClick={() => setStep(step - 1)}>Back</button>}
              <button type="button" className="btn" style={{ background: "#202020", color: "#F4F1EC", borderColor: "#202020" }} onClick={next}>{T.cta}</button>
              {(step === 2 || step === 3) && <button type="button" className="chip" style={{ border: 0, color: "#7A6B5A", textDecoration: "underline" }} onClick={() => setStep(step + 1)}>Skip</button>}
            </div>
          </div>

          <div style={{ flex: "1 1 320px", background: "#202020", color: "#F4F1EC", display: "grid", placeItems: "center", padding: 40, position: "relative", overflow: "hidden", minHeight: 460 }}>
            <svg viewBox="0 0 400 460" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: "auto 0 0 0", width: "100%", height: "55%" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".22" /></svg>
            <div style={{ position: "relative", width: 250, height: 360, borderRadius: 16, background: "#F4F1EC", color: "#202020", border: "1.5px solid #F4F1EC", transform: "rotate(3deg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div className="label" style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #202020", fontSize: 11 }}><span>Gripp Arcade</span><span>No. {String(p.serial).padStart(4, "0")}</span></div>
              <div style={{ display: "flex", gap: 12, padding: "16px 14px 0", alignItems: "center" }}>
                <Avatar handle={hh} size={68} />
                <div><div className="label" style={{ color: "#9a5545", fontSize: 11 }}>Tier I</div><div className="serif" style={{ font: "italic 200 32px/1 var(--serif)" }}>Cadet</div><div className="label" style={{ color: "#7A6B5A", fontSize: 11 }}>LV 01</div></div>
              </div>
              <div style={{ padding: "14px 14px 8px" }}><div style={{ fontWeight: 600, fontSize: 15 }}>@{hh}</div><div className="label" style={{ color: "#7A6B5A", fontSize: 11 }}>Squad {sq.name} · since Nov 2026</div></div>
              <div style={{ padding: "0 14px", display: "grid", gap: 8 }}>{["Precision", "Speed", "Brain", "Community"].map((k) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="label" style={{ fontSize: 11, width: 84 }}>{k}</span><span style={{ flex: 1, height: 4, background: "#DFD8D0", borderRadius: 9 }} /><span className="label" style={{ fontSize: 11 }}>20</span></div>)}</div>
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "12px 14px", borderTop: "1px solid #202020" }}><span className="label" style={{ fontSize: 11, color: "#7A6B5A" }}>Play one game to fill your stats</span><span className="serif" style={{ font: "200 26px/1 var(--serif)" }}>0</span></div>
            </div>
          </div>
        </div>
        <p className="label" style={{ marginTop: 14, color: "#7A6B5A", textAlign: "center" }}>Hub Points are a community game score, not an official PrismaX reward. Everything stays on this device.</p>
      </div>
    </div>
  );
}
