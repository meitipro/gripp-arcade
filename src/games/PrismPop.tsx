"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const N = 8, DUR = 60;
const COLORS = ["#B56654", "#B9986A", "#F4F1EC", "#7A6B5A", "#9bbf94"];
const SYMS = ["■", "●", "▲", "◆", "★"];
type Board = number[][];

function groupAt(b: Board, r: number, c: number): [number, number][] {
  const v = b[r][c]; if (v < 0) return [];
  const seen = new Set<number>([r * N + c]); const stack: [number, number][] = [[r, c]]; const out: [number, number][] = [];
  while (stack.length) {
    const [y, x] = stack.pop()!; out.push([y, x]);
    for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ny = y + dy, nx = x + dx;
      if (ny < 0 || nx < 0 || ny >= N || nx >= N || seen.has(ny * N + nx) || b[ny][nx] !== v) continue;
      seen.add(ny * N + nx); stack.push([ny, nx]);
    }
  }
  return out;
}
const hasMove = (b: Board) => b.some((row, r) => row.some((_, c) => groupAt(b, r, c).length >= 3));

export default function PrismPop({ seed, onReady, onProgress, onFinish }: GameProps) {
  const rng = useRef(mulberry32(seed));
  const kinds = useRef(4);
  const fresh = (): number => Math.floor(rng.current() * kinds.current);
  const init = useMemo(() => { const r = mulberry32(seed ^ 77); const b: Board = Array.from({ length: N }, () => Array.from({ length: N }, () => Math.floor(r() * 4))); return b; }, [seed]);
  const [board, setBoard] = useState<Board>(init);
  const [time, setTime] = useState(0);
  const st = useRef({ score: 0, chain: 0, lastPop: -99, t: 0, over: false });
  const log = useRef<{ t: number; r: number; c: number }[]>([]);
  const [msg, setMsg] = useState("");
  useEffect(() => { onReady(); }, [onReady]);
  useFrame((dt) => {
    const s = st.current; if (s.over) return;
    s.t += dt; setTime(s.t);
    if (s.t > 30) kinds.current = 5;
    if (s.t >= DUR) { s.over = true; onFinish({ score: s.score, log: log.current }); }
  });
  const pop = (r: number, c: number) => {
    const s = st.current; if (s.over) return;
    const g = groupAt(board, r, c);
    if (g.length < 3) { setMsg("Need 3 or more"); return; }
    s.chain = s.t - s.lastPop < 2 ? Math.min(6, s.chain + 1) : 1; s.lastPop = s.t;
    const pts = 2 * g.length * g.length * s.chain; s.score += pts; setMsg(`+${pts}${s.chain > 1 ? ` (chain x${s.chain})` : ""}`);
    log.current.push({ t: Math.round(s.t * 1000), r, c });
    const nb = board.map((row) => row.slice());
    for (const [y, x] of g) nb[y][x] = -1;
    for (let x = 0; x < N; x++) {
      const col = []; for (let y = N - 1; y >= 0; y--) if (nb[y][x] >= 0) col.push(nb[y][x]);
      while (col.length < N) col.push(fresh());
      for (let y = N - 1, i = 0; y >= 0; y--, i++) nb[y][x] = col[i];
    }
    setBoard(nb); onProgress?.(s.score);
    if (!hasMove(nb)) { s.over = true; onFinish({ score: s.score, log: log.current }); }
  };
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>TIME {Math.max(0, Math.ceil(DUR - time))}s · {msg || "Tap a group of 3 or more"}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${N}, 1fr)`, gap: 4, maxWidth: 440, margin: "12px auto" }}>
        {board.map((row, r) => row.map((v, c) => (
          <button key={r + "-" + c} className="tile" style={{ aspectRatio: "1", color: COLORS[v], fontSize: "1.4rem", padding: 0 }} onClick={() => pop(r, c)} aria-label={`Shape ${SYMS[v]} row ${r + 1} column ${c + 1}`}>{SYMS[v]}</button>
        )))}
      </div>
    </div>
  );
}
