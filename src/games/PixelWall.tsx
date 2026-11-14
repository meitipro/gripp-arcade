"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { hashString, mulberry32 } from "@/lib/rng";
import { SAMPLE_HANDLES } from "@/lib/members";
import { getState, update, useStore } from "@/lib/store";
import type { GameProps } from "./types";

const W = 48, H = 30, COOL = 10;
const PALETTE = ["#202020", "#F4F1EC", "#B56654", "#B9986A", "#7A6B5A", "#DFD8D0", "#9bbf94", "#6f8fb5", "#d97a66", "#e3c98f", "#5a4b3a", "#8a6fa8"];

export default function PixelWall({ onReady, onProgress, onFinish }: GameProps) {
  const s = useStore();
  const base = useMemo(() => {
    // a small sample mural drawn by sample members so the wall is never empty
    const m: Record<string, number> = {};
    SAMPLE_HANDLES.slice(0, 40).forEach((h) => { const r = mulberry32(hashString(h)); for (let i = 0; i < 18; i++) m[`${Math.floor(r() * W)},${Math.floor(r() * H)}`] = Math.floor(r() * 12); });
    for (let x = 18; x < 30; x++) { m[`${x},12`] = 3; m[`${x},13`] = 3; }
    for (let y = 8; y < 16; y++) { m[`22,${y}`] = 2; m[`26,${y}`] = 2; }
    return m;
  }, []);
  const [color, setColor] = useState(2);
  const [placed, setPlaced] = useState(0);
  const [cool, setCool] = useState(0);
  const log = useRef<{ x: number; y: number; c: number }[]>([]);
  const frozen = s.frozen;
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => { const id = setInterval(() => setCool((c) => Math.max(0, c - 1)), 1000); return () => clearInterval(id); }, []);
  const wall = { ...base, ...s.wall };
  const place = (x: number, y: number) => {
    if (frozen) return;
    if (cool > 0) return;
    update((st) => ({ ...st, wall: { ...st.wall, [`${x},${y}`]: color }, tiles: st.tiles + 1, wallLast: Date.now() }));
    log.current.push({ x, y, c: color }); setPlaced(placed + 1); onProgress?.(placed + 1); setCool(COOL);
  };
  void getState;
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>{frozen ? "WALL FROZEN BY STAFF" : cool > 0 ? `NEXT PIXEL IN ${cool}s` : "READY. TAP A CELL."} · placed {placed}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 720, imageRendering: "pixelated", background: "#151515", borderRadius: 8, margin: "10px 0", cursor: cool > 0 || frozen ? "not-allowed" : "crosshair" }}
        onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); place(Math.floor(((e.clientX - r.left) / r.width) * W), Math.floor(((e.clientY - r.top) / r.height) * H)); }} role="application" aria-label="Shared pixel canvas">
        {Object.entries(wall).map(([k, c]) => { const [x, y] = k.split(",").map(Number); return <rect key={k} x={x} y={y} width="1" height="1" fill={PALETTE[c as number]} />; })}
      </svg>
      <div className="row" style={{ justifyContent: "center", gap: 6 }}>
        {PALETTE.map((p, i) => <button key={p} onClick={() => setColor(i)} aria-label={`Color ${i + 1}`} style={{ width: 32, height: 32, borderRadius: 8, background: p, border: color === i ? "3px solid #B56654" : "2px solid #555", cursor: "pointer" }}>{color === i ? "✓" : ""}</button>)}
      </div>
      <p><button className="btn" onClick={() => onFinish({ score: placed, log: log.current })}>Finish and bank {placed} pixels</button></p>
    </div>
  );
}
