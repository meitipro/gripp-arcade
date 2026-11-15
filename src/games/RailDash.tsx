"use client";
import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const W = 600, H = 220, GROUND = 170, PX = 90, DUR = 90;
type Ob = { x: number; kind: "gap" | "hook" | "bolt"; done?: boolean };
export default function RailDash({ seed, reducedMotion, onReady, onProgress, onFinish }: GameProps) {
  const st = useRef({ t: 0, dist: 0, vy: 0, y: 0, duck: false, hearts: 3, bolts: 0, hurt: 0, over: false, obs: [] as Ob[], nextX: 500, last: "" });
  const rng = useRef(mulberry32(seed));
  const log = useRef<{ t: number; a: string }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  const act = (a: "jump" | "duck" | "up") => {
    const s = st.current; if (s.over) return;
    log.current.push({ t: Math.round(s.t * 1000), a });
    if (a === "jump" && s.y === 0) s.vy = 520; else if (a === "duck") s.duck = true; else if (a === "up") s.duck = false;
  };
  useEffect(() => {
    const d = (e: KeyboardEvent) => { if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); act("jump"); } if (e.key === "ArrowDown") act("duck"); };
    const u = (e: KeyboardEvent) => { if (e.key === "ArrowDown") act("up"); };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u); return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  });
  const score = () => Math.floor(st.current.dist / 10) + 10 * st.current.bolts;
  useFrame((dt) => {
    const s = st.current; if (s.over) return;
    // fixed step physics at 120Hz for fair replay
    let rem = dt;
    while (rem > 0) {
      const h = Math.min(rem, 1 / 120); rem -= h;
      s.t += h;
      const v = (reducedMotion ? 0.65 : 1) * 230 * Math.pow(1.1, Math.floor(s.t / 20));
      s.dist += v * h; s.nextX -= v * h;
      s.vy -= 1500 * h; s.y = Math.max(0, s.y + s.vy * h); if (s.y === 0 && s.vy < 0) s.vy = 0;
      if (s.hurt > 0) s.hurt -= h;
      for (const o of s.obs) {
        o.x -= v * h;
        if (o.done || o.x > PX + 20 || o.x < PX - 20) continue;
        if (o.kind === "bolt") { if (s.y > 20 || !s.duck) { o.done = true; s.bolts++; } }
        else if (s.hurt <= 0) {
          const ok = o.kind === "gap" ? s.y > 30 : s.duck || s.y > 90;
          o.done = true;
          if (!ok) { s.hearts--; s.hurt = 1; if (s.hearts <= 0) s.over = true; }
        }
      }
    }
    s.obs = s.obs.filter((o) => o.x > -50);
    while (s.nextX < W + 400) {
      const r = rng.current(); const kind: Ob["kind"] = r < 0.35 ? "gap" : r < 0.65 ? "hook" : "bolt";
      s.obs.push({ x: s.nextX, kind }); s.nextX += 150 + rng.current() * 150;
    }
    s.nextX -= 0;
    onProgress?.(score());
    if (s.t >= DUR) s.over = true;
    if (s.over) onFinish({ score: score(), log: log.current });
  });
  const s = st.current;
  // keep spawn cursor relative to scroll
  const px = PX, py = GROUND - s.y - (s.duck ? 14 : 34);
  return (
    <div style={{ textAlign: "center", touchAction: "manipulation" }}>
      <div className="mono" style={{ color: "#B9986A" }}>{"♥".repeat(Math.max(0, s.hearts))} · {Math.floor(s.dist / 10)} m · {s.bolts} bolts · {Math.max(0, Math.ceil(DUR - s.t))}s</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 680 }} onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); if ((e.clientY - r.top) / r.height > 0.6) { act("duck"); setTimeout(() => act("up"), 450); } else act("jump"); }} role="application" aria-label="Rail Dash. Space or tap top to jump, arrow down or tap bottom to duck.">
        <rect width={W} height={H} fill="#2a2a2a" rx="10" />
        <line x1="0" y1="20" x2={W} y2="20" stroke="#7A6B5A" strokeWidth="6" />
        <rect x="0" y={GROUND} width={W} height="50" fill="#3a3a3a" />
        {s.obs.map((o, i) => o.kind === "gap" ? <rect key={i} x={o.x - 24} y={GROUND} width="48" height="50" fill="#151515" /> :
          o.kind === "hook" ? <g key={i}><line x1={o.x} y1="20" x2={o.x} y2={GROUND - 36} stroke="#B56654" strokeWidth="5" /><path d={`M${o.x - 12} ${GROUND - 36} Q${o.x} ${GROUND - 14} ${o.x + 12} ${GROUND - 36}`} stroke="#B56654" strokeWidth="5" fill="none" /></g> :
          !o.done && <g key={i} transform={`translate(${o.x} ${GROUND - 66})`}><circle r="11" fill="#B9986A" /><circle r="4" fill="#2a2a2a" /><path d="M-3 -13h6l-1 5h-4z M-3 13h6l-1-5h-4z M-13 -3v6l5-1v-4z M13 -3v6l-5-1v-4z" fill="#B9986A" /></g>)}
        <rect x={px - 12} y={py} width="24" height={s.duck ? 20 : 34} rx="5" fill={s.hurt > 0 ? "#d97a66" : "#F4F1EC"} />
        <circle cx={px + 5} cy={py + 8} r="3" fill="#202020" />
      </svg>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn" onPointerDown={(e) => { e.stopPropagation(); act("jump"); }}>Jump</button>
        <button className="btn alt" onPointerDown={(e) => { e.stopPropagation(); act("duck"); }} onPointerUp={() => act("up")} onPointerLeave={() => act("up")}>Duck (hold)</button>
      </div>
    </div>
  );
}
