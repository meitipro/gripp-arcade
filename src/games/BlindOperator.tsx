"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const N = 11, TIME = 90, VIEW = 3;
function gen(seed: number) {
  const r = mulberry32(seed);
  for (let k = 0; k < 300; k++) {
    const g = Array.from({ length: N }, () => Array.from({ length: N }, () => { const v = r(); return v < 0.2 ? 1 : v < 0.28 ? 2 : 0; }));
    g[0][0] = 0; g[N - 1][N - 1] = 0;
    const p = bfs(g);
    if (p && p.length > N) return { g, safe: p };
  }
  return { g: Array.from({ length: N }, () => Array(N).fill(0)), safe: [[0, 0]] as [number, number][] };
}
function bfs(g: number[][], from: [number, number] = [0, 0]): [number, number][] | null {
  const prev = new Map<string, [number, number] | null>([[from.join(), null]]); const q = [from];
  while (q.length) {
    const [y, x] = q.shift()!;
    if (y === N - 1 && x === N - 1) { const out: [number, number][] = []; let c: [number, number] | null = [y, x]; while (c) { out.unshift(c); c = prev.get(c.join()) ?? null; } return out; }
    for (const [dy, dx] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const ny = y + dy, nx = x + dx; if (ny < 0 || nx < 0 || ny >= N || nx >= N || g[ny][nx] !== 0 || prev.has(ny + "," + nx)) continue;
      prev.set(ny + "," + nx, [y, x]); q.push([ny, nx]);
    }
  }
  return null;
}
export default function BlindOperator({ seed, onReady, onProgress, onFinish }: GameProps) {
  const { g } = useMemo(() => gen(seed), [seed]);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [pings, setPings] = useState(12);
  const [guide, setGuide] = useState("Guide: I can see the whole map. Ask for a ping when you are lost.");
  const [ping, setPing] = useState<[number, number][]>([]);
  const st = useRef({ t: 0, over: false });
  const log = useRef<{ t: number; a: string }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  const finish = (score: number) => { if (st.current.over) return; st.current.over = true; onFinish({ score, log: log.current }); };
  useFrame((dt) => { const s = st.current; if (s.over) return; s.t += dt; if (s.t >= TIME) { setGuide("Time is up."); finish(0); } });
  const move = (dy: number, dx: number) => {
    if (st.current.over) return;
    const ny = pos[0] + dy, nx = pos[1] + dx; if (ny < 0 || nx < 0 || ny >= N || nx >= N || g[ny][nx] === 1) return;
    log.current.push({ t: Math.round(st.current.t * 1000), a: `${dy},${dx}` });
    setPos([ny, nx]);
    if (g[ny][nx] === 2) { setGuide("Hazard! Mission ended."); finish(0); return; }
    if (ny === N - 1 && nx === N - 1) { const sc = 500 + Math.round((TIME - st.current.t) * 3) + pings * 20; onProgress?.(sc); setGuide("Goal reached!"); finish(sc); }
  };
  const askPing = () => {
    if (pings <= 0) return setGuide("Guide: no pings left.");
    const p = bfs(g, pos); setPings(pings - 1);
    if (!p || p.length < 2) return;
    const [ny, nx] = p[1]; const dir = ny > pos[0] ? "south" : ny < pos[0] ? "north" : nx > pos[1] ? "east" : "west";
    setGuide(`Guide: step ${dir}. ${p.length - 1} steps to the goal.`);
    setPing(p.slice(0, 4));
  };
  useEffect(() => {
    const f = (e: KeyboardEvent) => { const m: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }; if (m[e.key]) { e.preventDefault(); move(...m[e.key]); } else if (e.key === "p") askPing(); };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  });
  const vis = (y: number, x: number) => Math.abs(y - pos[0]) + Math.abs(x - pos[1]) <= VIEW;
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>TIME {Math.max(0, Math.ceil(TIME - st.current.t))}s · PINGS {pings} · you see radius {VIEW}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 2, maxWidth: 420, margin: "10px auto" }}>
        {g.map((row, y) => row.map((c, x) => {
          const v = vis(y, x), me = pos[0] === y && pos[1] === x, isG = y === N - 1 && x === N - 1;
          const pinged = ping.some(([py, px]) => py === y && px === x);
          return <div key={y + "-" + x} style={{ aspectRatio: "1", borderRadius: 4, display: "grid", placeItems: "center", fontSize: ".8rem", background: me ? "#B56654" : !v ? "#151515" : c === 1 ? "#666" : c === 2 ? "#6b2d2d" : "#2d2d2d", outline: pinged ? "2px solid #B9986A" : undefined, color: "#F4F1EC" }}>{me ? "●" : isG ? "G" : v ? (c === 1 ? "▓" : c === 2 ? "✕" : "") : ""}</div>;
        }))}
      </div>
      <p className="mono" style={{ minHeight: 20 }}>{guide}</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn alt" onClick={() => move(-1, 0)} aria-label="North">↑</button><button className="btn alt" onClick={() => move(0, -1)} aria-label="West">←</button>
        <button className="btn alt" onClick={() => move(1, 0)} aria-label="South">↓</button><button className="btn alt" onClick={() => move(0, 1)} aria-label="East">→</button>
        <button className="btn" onClick={askPing}>Ask Guide (P)</button>
      </div>
    </div>
  );
}
