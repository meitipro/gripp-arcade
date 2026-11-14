"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, shuffle } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const CMDS = ["calibrate --joint elbow --limit 120", "grip --force 0.35 --hold 2s --release", "home --all --confirm", "move --x 12 --y 40 --speed slow", "scan --lidar --range 8m", "rotate --axis z --deg 90", "lift --load 2kg --height 30", "stop --now", "sync --clock --utc", "patch --apply latest", "park --arm --lock", "teach --record demo7", "plan --route safe --avoid mud", "open --claw --width 6cm", "check --torque all", "reset --encoders"];
const DUR = 45;
export default function CommandLine({ seed, onReady, onProgress, onFinish }: GameProps) {
  const list = useMemo(() => { const r = mulberry32(seed); return [...shuffle(r, CMDS), ...shuffle(r, CMDS)]; }, [seed]);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const st = useRef({ t: 0, started: false, correct: 0, errors: 0, done: 0, over: false });
  const keys = useRef<{ k: string; t: number }[]>([]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { onReady(); input.current?.focus(); }, [onReady]);
  const calc = () => { const s = st.current; const total = s.correct + s.errors; const acc = total ? s.correct / total : 1; const mult = acc >= 0.98 ? 1.5 : acc >= 0.9 ? 1.2 : acc >= 0.8 ? 1 : 0.5; return { acc, score: Math.round(s.correct * mult + 5 * s.done) }; };
  useFrame((dt) => {
    const s = st.current; if (!s.started || s.over) return;
    s.t += dt;
    if (s.t >= DUR) { s.over = true; onFinish({ score: calc().score, log: keys.current.slice(-1500) }); }
  });
  const target = list[idx];
  const change = (v: string) => {
    const s = st.current; if (s.over) return;
    s.started = true;
    if (v.length > typed.length) {
      const ch = v[v.length - 1]; const ok = target[v.length - 1] === ch;
      if (ok) s.correct++; else s.errors++;
      keys.current.push({ k: ch, t: Math.round(s.t * 1000) });
    } else if (v.length < typed.length) s.errors++; // backspace counts as an error
    setTyped(v);
    onProgress?.(calc().score);
    if (v === target) { s.done++; setIdx((i) => i + 1); setTyped(""); onProgress?.(calc().score); }
  };
  const { acc } = calc();
  const wpm = st.current.t > 1 ? Math.round(st.current.correct / 5 / (st.current.t / 60)) : 0;
  return (
    <div onClick={() => input.current?.focus()} style={{ fontFamily: "var(--mono)", padding: 8 }}>
      <div className="row sp mono" style={{ color: "#B9986A" }}><span>TIME {Math.max(0, Math.ceil(DUR - st.current.t))}s</span><span>WPM {wpm}</span><span>ACC {Math.round(acc * 100)}%</span></div>
      <div style={{ background: "#151515", borderRadius: 12, padding: 16, margin: "12px 0", minHeight: 150 }}>
        {list.slice(Math.max(0, idx - 2), idx).map((c, i) => <div key={i} style={{ color: "#666" }}>$ {c}</div>)}
        <div style={{ wordBreak: "break-all" }}>
          <span style={{ color: "#B9986A" }}>$ </span>
          {target.split("").map((c, i) => <span key={i} style={{ color: i < typed.length ? (typed[i] === c ? "#9bbf94" : "#d97a66") : "#F4F1EC", background: i === typed.length ? "#B56654" : undefined }}>{c}</span>)}
        </div>
      </div>
      <input ref={input} value={typed} onChange={(e) => change(e.target.value)} aria-label="Type the command" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        style={{ width: "100%", background: "#2d2d2d", color: "#F4F1EC", border: "1.5px solid #B9986A" }} placeholder="Start typing to begin the 45 second clock" />
    </div>
  );
}
