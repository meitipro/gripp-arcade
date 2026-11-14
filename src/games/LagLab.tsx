"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { clamp, useFrame } from "./util";

const W = 600, H = 360, ROUNDS = 10, RING = 46;
export default function LagLab({ seed, onReady, onProgress, onFinish }: GameProps) {
  const targets = useMemo(() => { const r = mulberry32(seed); return Array.from({ length: ROUNDS }, () => ({ x: 80 + r() * (W - 160), y: 70 + r() * (H - 140) })); }, [seed]);
  const jr = useRef(mulberry32(seed ^ 0x9e3779b9));
  const svg = useRef<SVGSVGElement>(null);
  const ptr = useRef({ x: W / 2, y: H / 2 });
  const hist = useRef<{ t: number; x: number; y: number }[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState("Move, then tap to confirm");
  const roundStart = useRef(performance.now());
  const lock = useRef(false);
  const log = useRef<{ round: number; hitX: number; hitY: number; tConfirm: number }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  useFrame(() => { const t = performance.now(); hist.current.push({ t, ...ptr.current }); while (hist.current.length > 600) hist.current.shift(); });

  const delayFor = (r: number) => 40 + 25 * r + (r === ROUNDS - 1 ? (jr.current() - 0.5) * 100 : 0);
  const delayed = (d: number) => {
    const T = performance.now() - d; const h = hist.current; let p = h[0] ?? { ...ptr.current, t: T };
    for (const s of h) { if (s.t <= T) p = s; else break; }
    return p;
  };
  const d = 40 + 25 * round;
  const dc = delayed(d);
  const tg = targets[Math.min(round, ROUNDS - 1)];

  const confirm = () => {
    if (lock.current || round >= ROUNDS) return;
    lock.current = true;
    const dd = delayFor(round); const c = delayed(dd);
    const dist = Math.hypot(c.x - tg.x, c.y - tg.y);
    const acc = clamp(1 - dist / RING, 0, 1);
    const tc = performance.now() - roundStart.current;
    const bonus = acc > 0 ? Math.round(50 * clamp(1 - tc / 5000, 0, 1)) : 0;
    const pts = Math.round(60 * acc + bonus);
    log.current.push({ round, hitX: Math.round(c.x), hitY: Math.round(c.y), tConfirm: Math.round(tc) });
    const total = score + pts; setScore(total); onProgress?.(total);
    setMsg(acc > 0 ? `+${pts}` : "Miss");
    setTimeout(() => {
      lock.current = false;
      if (round + 1 >= ROUNDS) onFinish({ score: Math.min(1000, total), log: log.current });
      else { setRound(round + 1); roundStart.current = performance.now(); setMsg(round + 1 === ROUNDS - 1 ? "Jitter round" : "Next"); }
    }, 350);
  };
  const toLocal = (e: React.PointerEvent) => { const r = svg.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const st = 14;
      if (e.key === "ArrowLeft") ptr.current.x = clamp(ptr.current.x - st, 0, W);
      else if (e.key === "ArrowRight") ptr.current.x = clamp(ptr.current.x + st, 0, W);
      else if (e.key === "ArrowUp") ptr.current.y = clamp(ptr.current.y - st, 0, H);
      else if (e.key === "ArrowDown") ptr.current.y = clamp(ptr.current.y + st, 0, H);
      else if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); confirm(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  return (
    <div>
      <div className="mono" style={{ textAlign: "center", color: "#B9986A" }}>Round {Math.min(round + 1, ROUNDS)} / {ROUNDS} · LATENCY {Math.round(d)} ms · {msg}</div>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 680, cursor: "none" }}
        onPointerMove={(e) => { ptr.current = toLocal(e); }} onPointerDown={(e) => { ptr.current = toLocal(e); confirm(); }} role="application" aria-label="Lag lab arena. Arrow keys move, space confirms.">
        {Array.from({ length: 12 }, (_, i) => <line key={"v" + i} x1={i * 50 + 25} y1="0" x2={i * 50 + 25} y2={H} stroke="#333" />)}
        {Array.from({ length: 8 }, (_, i) => <line key={"h" + i} x1="0" y1={i * 50 + 10} x2={W} y2={i * 50 + 10} stroke="#333" />)}
        <circle cx={tg.x} cy={tg.y} r={RING} fill="none" stroke="#B56654" strokeWidth="3" />
        <circle cx={tg.x} cy={tg.y} r={RING * 0.5} fill="none" stroke="#B56654" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx={ptr.current.x} cy={ptr.current.y} r="5" fill="none" stroke="#777" />
        <circle cx={dc.x} cy={dc.y} r="9" fill="#B9986A" />
        <path d={`M${dc.x - 14} ${dc.y}H${dc.x + 14}M${dc.x} ${dc.y - 14}V${dc.y + 14}`} stroke="#F4F1EC" />
      </svg>
      <div className="mono" style={{ textAlign: "center", color: "#777" }}>The gold cursor follows you late. Tap to lock it on the ring.</div>
    </div>
  );
}
