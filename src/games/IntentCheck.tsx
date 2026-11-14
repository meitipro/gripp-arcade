"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, shuffle } from "@/lib/rng";
import type { GameProps } from "./types";

type Label = "accept" | "reject" | "borderline";
const CLIPS: { goal: string; steps: string[]; label: Label; reason: string }[] = [
  { goal: "Fold the towel in thirds", steps: ["Hands visible", "Edge to edge fold", "Second fold, flat", "Towel in a clean stack"], label: "accept", reason: "Clear intent, hands in frame, clean result." },
  { goal: "Put the red cup on the shelf", steps: ["Grips the cup", "Moves across", "Cup tips over on the shelf", "Walks away"], label: "reject", reason: "The cup ended up on its side. The task was not completed." },
  { goal: "Sort three blocks by color", steps: ["Picks blue", "Picks red", "Drops green in the wrong bin", "Fixes it after a pause"], label: "borderline", reason: "Completed, but with a visible mistake and a late fix." },
  { goal: "Open the drawer", steps: ["Reaches handle", "Pulls smoothly", "Drawer fully open", "Hand retreats"], label: "accept", reason: "Smooth, complete, and the camera sees everything." },
  { goal: "Pour water into the glass", steps: ["Camera blurs", "Water level unclear", "Glass seems full", "Cut to black"], label: "reject", reason: "Blur and a cut hide the key moment. Not verifiable." },
  { goal: "Stack two boxes", steps: ["Lifts box A", "Places on box B", "Stack wobbles", "Settles after a second"], label: "borderline", reason: "It held, but the wobble makes the demo shaky." },
  { goal: "Press the green button", steps: ["Arm approaches", "Presses the red button", "Light turns red", "Stops"], label: "reject", reason: "Wrong button. The intent was not met." },
  { goal: "Hand over the screwdriver", steps: ["Picks up tool", "Rotates handle forward", "Partner takes it", "Clean release"], label: "accept", reason: "Good handle orientation and a clean release." },
  { goal: "Wipe the table", steps: ["Cloth picked up", "Wipes left half only", "Stops", "Puts cloth down"], label: "borderline", reason: "Only half the table was wiped." },
  { goal: "Plug in the cable", steps: ["Aligns the plug", "Pushes in", "Light turns on", "Hand stays steady"], label: "accept", reason: "Aligned first try, confirmed by the light." },
  { goal: "Move the ball into the box", steps: ["Ball rolls away", "Robot idles", "Ball put in by a human hand", "Done"], label: "reject", reason: "A human hand did the work. Not a robot demonstration." },
  { goal: "Close the lid", steps: ["Finds lid", "Slides it on", "Small gap left", "Taps once more, closed"], label: "accept", reason: "A small retry, then a fully closed lid." },
];
export default function IntentCheck({ seed, onReady, onProgress, onFinish }: GameProps) {
  const clips = useMemo(() => shuffle(mulberry32(seed), CLIPS).slice(0, 10), [seed]);
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0);
  const [reveal, setReveal] = useState<null | { ok: boolean; pts: number }>(null);
  const score = useRef(0); const streak = useRef(0);
  const t0 = useRef(Date.now());
  const log = useRef<{ clip: number; choice: string; tMs: number }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => {
    setStep(0); t0.current = Date.now();
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1100);
    return () => clearInterval(id);
  }, [i]);
  const c = clips[i];
  const pick = (choice: "accept" | "reject") => {
    if (reveal) return;
    const ms = Date.now() - t0.current;
    const correct = c.label === choice, border = c.label === "borderline";
    let pts = border ? 60 : correct ? 100 : 0;
    if (pts > 0) pts += Math.round(20 * Math.max(0, 1 - ms / 10000));
    if (correct && !border) { streak.current++; if (streak.current % 3 === 0) pts += 25; } else if (!border) streak.current = 0;
    score.current += pts; onProgress?.(score.current);
    log.current.push({ clip: CLIPS.indexOf(c), choice, tMs: ms });
    setReveal({ ok: correct || border, pts });
  };
  const nextClip = () => { setReveal(null); if (i + 1 >= clips.length) onFinish({ score: score.current, log: log.current }); else setI(i + 1); };
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>CLIP {i + 1} / {clips.length} · STREAK {streak.current}</div>
      <div style={{ background: "#151515", borderRadius: 14, padding: 20, margin: "12px 0", minHeight: 140 }}>
        <div className="mono" style={{ color: "#d97a66" }}>● REC</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", margin: "6px 0 14px" }}>Goal: {c.goal}</div>
        <div aria-live="off" style={{ fontFamily: "var(--mono)", fontSize: ".9rem", color: "#DFD8D0" }}>{c.steps.map((s, k) => <div key={k} style={{ opacity: k <= step ? 1 : 0.25 }}>{k + 1}. {s}</div>)}</div>
      </div>
      {reveal ? (
        <div>
          <p><b>{c.label.toUpperCase()}</b> · {reveal.ok ? "Good call" : "Not this time"} · +{reveal.pts}</p>
          <p className="muted" style={{ color: "#DFD8D0" }}>{c.reason}</p>
          <button className="btn" onClick={nextClip}>{i + 1 >= clips.length ? "Finish" : "Next clip"}</button>
        </div>
      ) : (
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn alt" onClick={() => pick("reject")}>Reject</button>
          <button className="btn" onClick={() => pick("accept")}>Valid</button>
        </div>
      )}
    </div>
  );
}
