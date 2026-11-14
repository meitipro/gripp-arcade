"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import { robotFace, SAMPLE_HANDLES } from "@/lib/members";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const W = 400, H = 300, DROPS = 8;
interface Cap { id: number; x: number; y: number; gold: boolean; handle: string; got: boolean; tries: number }
export default function ClawClub({ seed, reducedMotion, onReady, onProgress, onFinish }: GameProps) {
  const rng = useRef(mulberry32(seed ^ 0xabcdef));
  const caps = useRef<Cap[]>([]);
  if (!caps.current.length) {
    const r = mulberry32(seed);
    caps.current = Array.from({ length: 14 }, (_, i) => ({ id: i, x: 30 + r() * (W - 60), y: 214 + r() * 40, gold: r() < 0.15, handle: SAMPLE_HANDLES[Math.floor(r() * SAMPLE_HANDLES.length)], got: false, tries: 0 }));
  }
  const st = useRef({ t: 0, phase: "swing" as "swing" | "down" | "up" | "carry" | "done", x: 200, y: 40, drop: 0, score: 0, carry: null as Cap | null, tphase: 0, msg: "" });
  const log = useRef<{ drop: number; x: number; caught: boolean }[]>([]);
  const [revealed, setRevealed] = useState<string | null>(null);
  useEffect(() => { onReady(); }, [onReady]);
  const grip = () => Math.max(0.35, 0.95 - 0.12 * Math.floor(st.current.drop / 2));
  const k = reducedMotion ? 0.6 : 1;
  useFrame((dt) => {
    const s = st.current; s.t += dt;
    if (s.phase === "swing") s.x = W / 2 + (W / 2 - 30) * Math.sin(s.t * 1.3 * k);
    else if (s.phase === "down") {
      s.y += 220 * dt;
      if (s.y >= 200) {
        const near = caps.current.filter((c) => !c.got && Math.abs(c.x - s.x) < 26).sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x))[0];
        if (near) { near.tries++; if (rng.current() < grip()) s.carry = near; }
        s.phase = "up"; log.current.push({ drop: s.drop, x: Math.round(s.x), caught: !!s.carry });
      }
    } else if (s.phase === "up") {
      s.y -= 220 * dt; if (s.carry) { s.carry.x = s.x; s.carry.y = s.y + 14; }
      if (s.y <= 40) {
        s.y = 40;
        if (s.carry) { s.phase = "carry"; } else next();
      }
    } else if (s.phase === "carry") {
      s.x -= 160 * dt; if (s.carry) { s.carry.x = s.x; s.carry.y = 54; }
      if (s.x <= 34 && s.carry) {
        const c = s.carry; c.got = true; s.carry = null;
        s.score += (c.gold ? 2 : 1) * (100 + (c.tries === 1 ? 50 : 0)); onProgress?.(s.score);
        setRevealed(c.handle); setTimeout(() => setRevealed(null), 1500); next();
      }
    }
  });
  function next() {
    const s = st.current; s.drop++;
    if (s.drop >= DROPS) { s.phase = "done"; onFinish({ score: s.score, log: log.current }); }
    else { s.phase = "swing"; s.t = 0; }
  }
  const dropClaw = () => { const s = st.current; if (s.phase === "swing") s.phase = "down"; };
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); dropClaw(); } };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  });
  const s = st.current;
  return (
    <div style={{ textAlign: "center" }} onPointerDown={dropClaw}>
      <div className="mono" style={{ color: "#B9986A" }}>DROP {Math.min(s.drop + 1, DROPS)} / {DROPS} · GRIP {Math.round(grip() * 100)}% · tap to drop the claw {revealed ? `· you caught @${revealed}` : ""}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 520 }} role="button" aria-label="Drop the claw">
        <rect x="0" y="0" width={W} height={H} fill="#2a2a2a" rx="10" />
        <rect x="0" y="40" width="64" height="40" fill="#3a3a3a" /><text x="32" y="64" textAnchor="middle" fill="#B9986A" fontSize="10" fontFamily="monospace">CHUTE</text>
        <line x1={s.x} y1="0" x2={s.x} y2={s.y} stroke="#777" strokeWidth="3" />
        <path d={`M${s.x - 18} ${s.y + 18} L${s.x} ${s.y} L${s.x + 18} ${s.y + 18}`} stroke="#F4F1EC" strokeWidth="5" fill="none" strokeLinecap="round" />
        {caps.current.filter((c) => !c.got).map((c) => (
          <g key={c.id}><circle cx={c.x} cy={c.y} r="16" fill={c.gold ? "#B9986A" : "#DFD8D0"} /><svg x={c.x - 11} y={c.y - 11} width="22" height="22" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: robotFace(c.handle) }} /></g>
        ))}
      </svg>
    </div>
  );
}
