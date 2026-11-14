"use client";
import { useEffect, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const W = 400, BH = 22, BASE = 200;
export default function TabletopTower({ seed, reducedMotion, onReady, onProgress, onFinish }: GameProps) {
  const phase0 = useRef(mulberry32(seed)() * Math.PI * 2);
  const st = useRef({ t: 0, blocks: [{ x: W / 2 - BASE / 2, w: BASE }] as { x: number; w: number }[], streak: 0, bonus: 0, over: false, fall: null as null | { x: number; w: number; y: number } });
  const log = useRef<{ floor: number; tDrop: number }[]>([]);
  const [, force] = useState(0);
  useEffect(() => { onReady(); }, [onReady]);
  const floors = () => st.current.blocks.length - 1;
  const speed = () => (reducedMotion ? 0.6 : 1) * (1.6 + 0.25 * Math.floor(floors() / 5));
  const top = () => st.current.blocks[st.current.blocks.length - 1];
  const swingX = (t: number, w: number) => { const range = W - w; return range / 2 + (range / 2) * Math.sin(t * speed() + phase0.current); };
  const score = () => floors() + 2 * st.current.bonus;
  useFrame((dt) => {
    const s = st.current;
    if (!s.over) s.t += dt;
    if (s.fall) { s.fall.y += 400 * dt; if (s.fall.y > 500) s.fall = null; }
  });
  const drop = () => {
    const s = st.current; if (s.over) return;
    const cur = top(); const x = swingX(s.t, cur.w);
    log.current.push({ floor: floors() + 1, tDrop: Math.round(s.t * 1000) });
    const off = x - cur.x;
    if (Math.abs(off) <= 4) { s.streak++; s.bonus += s.streak; s.blocks.push({ x: cur.x, w: Math.min(BASE, cur.w + (s.streak > 1 ? 10 : 0)) }); }
    else {
      s.streak = 0;
      const left = Math.max(x, cur.x), right = Math.min(x + cur.w, cur.x + cur.w), w = right - left;
      if (w <= 0) { s.over = true; s.fall = { x, w: cur.w, y: 0 }; onFinish({ score: score(), log: log.current }); force((n) => n + 1); return; }
      s.fall = { x: off > 0 ? right : x, w: cur.w - w, y: 0 };
      s.blocks.push({ x: left, w });
    }
    onProgress?.(score());
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); drop(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const s = st.current; const cur = top(); const n = s.blocks.length;
  const camY = Math.max(0, (n - 8) * BH);
  const yOf = (i: number) => 330 - i * BH + camY;
  return (
    <div style={{ textAlign: "center" }} onPointerDown={drop}>
      <div className="mono" style={{ color: "#B9986A" }}>FLOORS {floors()} · PERFECT x{s.streak} · tap or press space to drop</div>
      <svg viewBox={`0 0 ${W} 360`} width="100%" style={{ maxWidth: 480, touchAction: "manipulation" }} role="button" aria-label="Drop the block">
        <rect x="0" y="352" width={W} height="8" fill="#7A6B5A" />
        {s.blocks.map((b, i) => <rect key={i} x={b.x} y={yOf(i)} width={b.w} height={BH - 2} fill={i % 2 ? "#B9986A" : "#B56654"} />)}
        {!s.over && <rect x={swingX(s.t, cur.w)} y={yOf(n)} width={cur.w} height={BH - 2} fill="#F4F1EC" />}
        {s.fall && <rect x={s.fall.x} y={yOf(n - 1) + s.fall.y} width={s.fall.w} height={BH - 2} fill="#777" />}
      </svg>
    </div>
  );
}
