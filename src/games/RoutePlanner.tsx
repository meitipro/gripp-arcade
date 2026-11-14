"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, Rand } from "@/lib/rng";
import type { GameProps } from "./types";

// cell: 0 open, 1 wall, 2 mud (cost 2), 3 hazard (ends path, blocked)
const SIZES = [6, 7, 9, 11];
interface Board { n: number; cells: number[][]; opt: number }

function solve(cells: number[][], n: number): number {
  const dist = Array.from({ length: n }, () => Array(n).fill(Infinity)); dist[0][0] = 0;
  const q: [number, number][] = [[0, 0]];
  while (q.length) {
    q.sort((a, b) => dist[a[0]][a[1]] - dist[b[0]][b[1]]);
    const [y, x] = q.shift()!;
    for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ny = y + dy, nx = x + dx;
      if (ny < 0 || nx < 0 || ny >= n || nx >= n || cells[ny][nx] === 1 || cells[ny][nx] === 3) continue;
      const nd = dist[y][x] + (cells[ny][nx] === 2 ? 2 : 1);
      if (nd < dist[ny][nx]) { dist[ny][nx] = nd; q.push([ny, nx]); }
    }
  }
  return dist[n - 1][n - 1];
}
function gen(r: Rand, n: number, level: number): Board {
  for (let tries = 0; tries < 200; tries++) {
    const cells = Array.from({ length: n }, () => Array.from({ length: n }, () => { const v = r(); return v < 0.18 ? 1 : v < 0.18 + 0.12 ? 2 : v < 0.3 + 0.03 * level ? 3 : 0; }));
    cells[0][0] = 0; cells[n - 1][n - 1] = 0;
    const opt = solve(cells, n);
    if (opt < Infinity && opt >= n) return { n, cells, opt };
  }
  return { n, cells: Array.from({ length: n }, () => Array(n).fill(0)), opt: 2 * (n - 1) };
}
const SYMBOL = ["", "▓", "≈", "✕"];

export default function RoutePlanner({ seed, onReady, onProgress, onFinish }: GameProps) {
  const boards = useMemo(() => { const r = mulberry32(seed); return SIZES.map((n, i) => gen(r, n, i)); }, [seed]);
  const [bi, setBi] = useState(0);
  const [path, setPath] = useState<[number, number][]>([[0, 0]]);
  const score = useRef(0); const allOpt = useRef(true);
  const log = useRef<{ board: number; path: [number, number][] }[]>([]);
  const dragging = useRef(false);
  useEffect(() => { onReady(); }, [onReady]);
  const b = boards[bi];
  const cost = path.slice(1).reduce((a, [y, x]) => a + (b.cells[y][x] === 2 ? 2 : 1), 0);
  const last = path[path.length - 1];
  const reached = last[0] === b.n - 1 && last[1] === b.n - 1;

  const step = (y: number, x: number) => {
    if (reached) return;
    const prev = path[path.length - 2];
    if (prev && prev[0] === y && prev[1] === x) return setPath(path.slice(0, -1));   // undo is free
    if (Math.abs(y - last[0]) + Math.abs(x - last[1]) !== 1) return;
    const c = b.cells[y][x]; if (c === 1 || c === 3) return;
    setPath([...path, [y, x]]);
  };
  const submit = () => {
    const extra = Math.max(0, cost - b.opt);
    const pts = Math.max(25, 250 - 25 * extra);
    if (extra > 0) allOpt.current = false;
    score.current += pts; log.current.push({ board: bi, path });
    onProgress?.(score.current);
    if (bi + 1 >= boards.length) onFinish({ score: score.current + (allOpt.current ? 100 : 0), log: log.current });
    else { setBi(bi + 1); setPath([[0, 0]]); }
  };
  const cellFromEvent = (e: React.PointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const d = el?.dataset; if (d?.y !== undefined) step(Number(d.y), Number(d.x));
  };
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>BOARD {bi + 1}/{boards.length} · COST {cost} · BEST POSSIBLE {b.opt} · ▓ wall ≈ mud x2 ✕ hazard</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${b.n}, 1fr)`, gap: 3, maxWidth: 460, margin: "12px auto", touchAction: "none" }}
        onPointerDown={(e) => { dragging.current = true; cellFromEvent(e); }} onPointerMove={(e) => { if (dragging.current) cellFromEvent(e); }} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
        {b.cells.map((row, y) => row.map((c, x) => {
          const on = path.some(([py, px]) => py === y && px === x);
          const head = last[0] === y && last[1] === x;
          const bg = head ? "#B56654" : on ? "#B9986A" : c === 1 ? "#555" : c === 2 ? "#5a4b3a" : c === 3 ? "#3a2a2a" : "#2d2d2d";
          return <div key={y + "-" + x} data-y={y} data-x={x} style={{ aspectRatio: "1", background: bg, borderRadius: 6, display: "grid", placeItems: "center", color: on ? "#202020" : "#F4F1EC", fontWeight: 700, fontSize: b.n > 9 ? ".7rem" : ".95rem" }}>
            {y === 0 && x === 0 ? "S" : y === b.n - 1 && x === b.n - 1 ? "G" : SYMBOL[c]}</div>;
        }))}
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn alt" onClick={() => setPath([[0, 0]])}>Reset</button>
        <button className="btn" disabled={!reached} onClick={submit}>{reached ? "Run the robot" : "Draw a path to G"}</button>
      </div>
    </div>
  );
}
