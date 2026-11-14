"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, Rand, shuffle } from "@/lib/rng";
import type { GameProps } from "./types";
import { trace, type M } from "@/lib/optics";

const N = 6;
interface Board { grid: M[][]; row: number; targets: [number, number][]; flipped: [number, number][]; par: number }

function gen(r: Rand, level: number): Board {
  for (let k = 0; k < 400; k++) {
    const grid: M[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => (r() < 0.3 ? ((1 + Math.floor(r() * 2)) as M) : 0)));
    const row = Math.floor(r() * N);
    const path = trace(grid, row);
    const uniq = [...new Map(path.map((p) => [p.join(), p])).values()].filter(([y, x]) => grid[y][x] === 0);
    const nT = level + 1;
    if (uniq.length < nT + 3) continue;
    const targets = shuffle(r, uniq).slice(0, nT) as [number, number][];
    const onPath = [...new Map(path.filter(([y, x]) => grid[y][x] !== 0).map((p) => [p.join(), p])).values()] as [number, number][];
    if (onPath.length < 2) continue;
    const flipN = Math.min(onPath.length, 2 + level);
    const flipped = shuffle(r, onPath).slice(0, flipN) as [number, number][];
    const g2 = grid.map((rw) => rw.slice()) as M[][];
    for (const [y, x] of flipped) g2[y][x] = g2[y][x] === 1 ? 2 : 1;
    const lit = new Set(trace(g2, row).map((p) => p.join()));
    if (targets.every((t) => lit.has(t.join()))) continue; // must start unsolved
    return { grid: g2, row, targets, flipped, par: flipN };
  }
  return { grid: Array.from({ length: N }, () => Array(N).fill(0)) as M[][], row: 0, targets: [[0, 3]], flipped: [], par: 0 };
}

export default function PrismBender({ seed, onReady, onProgress, onFinish }: GameProps) {
  const boards = useMemo(() => { const r = mulberry32(seed); return [0, 1, 2].map((l) => gen(r, l)); }, [seed]);
  const [bi, setBi] = useState(0);
  const [grid, setGrid] = useState<M[][]>(boards[0].grid);
  const [moves, setMoves] = useState(0);
  const [hints, setHints] = useState(0);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const score = useRef(0);
  const log = useRef<{ board: number; moves: number; hints: number; grid: M[][] }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  const b = boards[bi];
  const lit = useMemo(() => new Set(trace(grid, b.row).map((p) => p.join())), [grid, b.row]);
  const path = useMemo(() => trace(grid, b.row), [grid, b.row]);
  const solved = b.targets.every((t) => lit.has(t.join()));

  const flip = (y: number, x: number) => {
    if (solved || grid[y][x] === 0) return;
    const g = grid.map((r) => r.slice()) as M[][]; g[y][x] = g[y][x] === 1 ? 2 : 1;
    setGrid(g); setMoves(moves + 1); setHint(null);
  };
  const giveHint = () => {
    // hint = a mirror whose orientation differs from the generated-solution board
    const origin = b.flipped.find(([y, x]) => grid[y][x] === boards[bi].grid[y][x]);
    if (origin) { setHint(origin); setHints(hints + 1); }
  };
  const next = () => {
    const pts = Math.max(100, 300 + 40 * (b.par - moves)) - 50 * hints;
    score.current += Math.max(0, pts); onProgress?.(score.current);
    log.current.push({ board: bi, moves, hints, grid });
    if (bi + 1 >= boards.length) return onFinish({ score: score.current, log: log.current });
    setBi(bi + 1); setGrid(boards[bi + 1].grid); setMoves(0); setHints(0); setHint(null);
  };
  const cell = 56;
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>BOARD {bi + 1}/3 · MOVES {moves} · PAR {b.par} · hints −50</div>
      <svg viewBox={`-30 0 ${N * cell + 60} ${N * cell}`} width="100%" style={{ maxWidth: 440, margin: "10px auto" }} role="application" aria-label="Prism Bender board. Tap a mirror to rotate it.">
        {Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => <rect key={y + "," + x} x={x * cell + 1} y={y * cell + 1} width={cell - 2} height={cell - 2} rx="6" fill="#2d2d2d" />))}
        <polyline fill="none" stroke="#B9986A" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" opacity=".9"
          points={[[b.row, -0.5] as [number, number], ...path, ...[[0, 0]].slice(0, 0)].map(([y, x]) => `${(x + 0.5) * cell},${(y + 0.5) * cell}`).join(" ")} />
        {b.targets.map(([y, x]) => <g key={"t" + y + x}><circle cx={(x + 0.5) * cell} cy={(y + 0.5) * cell} r="14" fill={lit.has(y + "," + x) ? "#F4F1EC" : "none"} stroke="#B56654" strokeWidth="3" /><text x={(x + 0.5) * cell} y={(y + 0.5) * cell + 4} textAnchor="middle" fontSize="11" fill="#202020">{lit.has(y + "," + x) ? "✓" : ""}</text></g>)}
        {grid.map((row, y) => row.map((m, x) => m ? (
          <g key={"m" + y + x} onClick={() => flip(y, x)} style={{ cursor: "pointer" }}>
            <rect x={x * cell} y={y * cell} width={cell} height={cell} fill="transparent" />
            <line x1={m === 1 ? x * cell + 12 : x * cell + 12} y1={m === 1 ? (y + 1) * cell - 12 : y * cell + 12} x2={(x + 1) * cell - 12} y2={m === 1 ? y * cell + 12 : (y + 1) * cell - 12} stroke={hint && hint[0] === y && hint[1] === x ? "#B56654" : "#F4F1EC"} strokeWidth="6" strokeLinecap="round" />
          </g>) : null))}
        <text x={-26} y={(b.row + 0.5) * cell + 4} fill="#B9986A" fontSize="12">▶</text>
      </svg>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn alt" onClick={giveHint} disabled={solved}>Hint −50</button>
        <button className="btn" onClick={next} disabled={!solved}>{solved ? (bi + 1 >= 3 ? "Finish" : "Next board") : "Light every ring"}</button>
      </div>
    </div>
  );
}
