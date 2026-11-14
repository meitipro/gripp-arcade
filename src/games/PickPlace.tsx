"use client";
import { useEffect, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const DUR = 60, W = 600, H = 360, SHAPES = ["square", "circle", "triangle"] as const;
type Shape = (typeof SHAPES)[number];
interface Item { id: number; shape: Shape; x: number }
const Glyph = ({ s, x, y, size = 22, fill = "#F4F1EC" }: { s: Shape; x: number; y: number; size?: number; fill?: string }) =>
  s === "square" ? <rect x={x - size} y={y - size} width={size * 2} height={size * 2} fill={fill} /> :
  s === "circle" ? <circle cx={x} cy={y} r={size} fill={fill} /> :
  <path d={`M${x} ${y - size} L${x + size} ${y + size} L${x - size} ${y + size} Z`} fill={fill} />;

export default function PickPlace({ seed, reducedMotion, onReady, onProgress, onFinish }: GameProps) {
  const rng = useRef(mulberry32(seed));
  const st = useRef({ t: 0, items: [] as Item[], nextId: 0, spawn: 0.6, combo: 1, score: 0, sel: null as number | null, last: -1, over: false });
  const log = useRef<{ t: number; itemId: number; bin: number }[]>([]);
  const [msg, setMsg] = useState("");
  const [drag, setDrag] = useState<{ id: number; x: number; y: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => { onReady(); }, [onReady]);

  const speedAt = (t: number) => (reducedMotion ? 0.5 : 1) * 70 * Math.pow(1.08, Math.floor(t / 15));
  useFrame((dt) => {
    const s = st.current; if (s.over) return;
    s.t += dt;
    s.spawn -= dt;
    if (s.spawn <= 0) { s.items.push({ id: s.nextId++, shape: SHAPES[Math.floor(rng.current() * 3)], x: -30 }); s.spawn = 1.5 + rng.current() * 0.8; }
    const v = speedAt(s.t);
    for (const it of s.items) if (!(drag && drag.id === it.id)) it.x += v * dt;
    const fell = s.items.filter((i) => i.x > W + 30 && !(drag && drag.id === i.id));
    if (fell.length) { s.combo = 1; s.items = s.items.filter((i) => !fell.includes(i)); setMsg("Missed. Combo reset."); }
    if (s.t >= DUR) { s.over = true; onFinish({ score: Math.max(0, s.score), log: log.current }); }
  });

  const place = (id: number, bin: number) => {
    const s = st.current; const it = s.items.find((i) => i.id === id); if (!it || s.over) return;
    if (s.t - s.last < 0.18) return; // floor between drops blocks scripted input
    s.last = s.t;
    s.items = s.items.filter((i) => i.id !== id);
    log.current.push({ t: Math.round(s.t * 1000), itemId: id, bin });
    if (SHAPES[bin] === it.shape) { s.score += 10 * s.combo; s.combo = Math.min(8, s.combo + 1); setMsg(`+${10 * (s.combo > 1 ? s.combo - 1 : 1)}`); }
    else { s.score -= 5; s.combo = 1; setMsg("Wrong bin −5"); }
    onProgress?.(Math.max(0, s.score)); setDrag(null); s.sel = null;
  };
  const pt = (e: React.PointerEvent) => { const r = svg.current!.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  const binAt = (x: number) => Math.max(0, Math.min(2, Math.floor((x / W) * 3)));
  const down = (e: React.PointerEvent, id: number) => { (e.target as Element).setPointerCapture?.(e.pointerId); const p = pt(e); setDrag({ id, ...p }); st.current.sel = id; };
  const move = (e: React.PointerEvent) => { if (drag) setDrag({ ...drag, ...pt(e) }); };
  const up = (e: React.PointerEvent) => { if (!drag) return; const p = pt(e); if (p.y > 240) place(drag.id, binAt(p.x)); else setDrag(null); };
  const s = st.current;
  // tap mode: select an item, then tap a bin
  const tapBin = (b: number) => { if (s.sel !== null && !drag) place(s.sel, b); };
  return (
    <div>
      <div className="mono" style={{ textAlign: "center", color: "#B9986A" }}>Time {Math.max(0, Math.ceil(DUR - s.t))}s · Combo x{s.combo} · {msg || "Drag to a bin, or tap an item then a bin"}</div>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 680 }} onPointerMove={move} onPointerUp={up} role="application" aria-label="Pick and place conveyor">
        <rect x="0" y="120" width={W} height="70" fill="#3a3a3a" />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={(i * 30 + s.t * speedAt(0) * 0.6) % (W + 30) - 15} y1="120" x2={(i * 30 + s.t * speedAt(0) * 0.6) % (W + 30) - 15} y2="190" stroke="#2a2a2a" strokeWidth="3" />)}
        {SHAPES.map((sh, b) => (
          <g key={sh} onClick={() => tapBin(b)} style={{ cursor: "pointer" }}>
            <rect x={b * 200 + 12} y="250" width="176" height="96" rx="14" fill="none" stroke="#B9986A" strokeWidth="2" strokeDasharray="6 4" />
            <Glyph s={sh} x={b * 200 + 100} y={298} size={20} fill="#B9986A" />
            <text x={b * 200 + 100} y="338" textAnchor="middle" fill="#B9986A" fontFamily="monospace" fontSize="11">{sh.toUpperCase()}</text>
          </g>
        ))}
        {s.items.map((it) => {
          const d = drag && drag.id === it.id;
          return <g key={it.id} onPointerDown={(e) => down(e, it.id)} style={{ cursor: "grab", touchAction: "none" }}>
            <circle cx={d ? drag!.x : it.x} cy={d ? drag!.y : 155} r="34" fill={s.sel === it.id ? "#B56654" : "transparent"} opacity=".5" />
            <Glyph s={it.shape} x={d ? drag!.x : it.x} y={d ? drag!.y : 155} />
          </g>;
        })}
      </svg>
    </div>
  );
}
