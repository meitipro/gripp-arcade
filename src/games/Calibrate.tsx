"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { useFrame, beep } from "./util";

const ROUNDS = 12;
export default function Calibrate({ seed, onReady, onProgress, onFinish }: GameProps) {
  const plan = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: ROUNDS }, (_, i) => ({
      target: (r() - 0.5) * 90,                       // degrees from center
      half: Math.max(3, 14 - i * 1.0),                // target shrinks each round
      speed: 1.3 + 0.45 * Math.floor(i / 3),          // faster every three rounds
      phase: r() * Math.PI * 2,
    }));
  }, [seed]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const t0 = useRef(performance.now());
  const log = useRef<{ round: number; tLock: number }[]>([]);
  const lock = useRef(false);
  useEffect(() => { onReady(); }, [onReady]);

  const p = plan[Math.min(round, ROUNDS - 1)];
  const t = (performance.now() - t0.current) / 1000;
  const angle = Math.sin(t * p.speed + p.phase) * 75;
  useFrame(() => {}, round < ROUNDS);

  const tap = () => {
    if (lock.current || round >= ROUNDS) return;
    lock.current = true;
    const d = Math.abs(angle - p.target);
    const pts = d < 0.6 ? 100 : Math.max(0, Math.round(100 * (1 - d / p.half)));
    log.current.push({ round, tLock: Math.round(t * 1000) });
    const total = score + pts;
    setScore(total); onProgress?.(total);
    setFlash(pts >= 100 ? "PERFECT +100" : pts > 0 ? `+${pts}` : "MISS");
    beep(300 + pts * 4, 80);
    setTimeout(() => {
      setFlash(null); lock.current = false;
      if (round + 1 >= ROUNDS) onFinish({ score: total, log: log.current });
      else { setRound(round + 1); t0.current = performance.now(); }
    }, 450);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); tap(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const pt = (deg: number, r: number) => { const a = ((deg - 90) * Math.PI) / 180; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)]; };
  const arc = (a1: number, a2: number, r: number) => { const [x1, y1] = pt(a1, r), [x2, y2] = pt(a2, r); return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`; };
  const [nx, ny] = pt(angle, 120);
  return (
    <div onPointerDown={tap} style={{ cursor: "pointer", textAlign: "center" }} role="button" tabIndex={0} aria-label="Tap or press space to lock the needle">
      <div className="mono" style={{ color: "#B9986A" }}>Round {Math.min(round + 1, ROUNDS)} / {ROUNDS}</div>
      <svg viewBox="0 0 300 190" width="100%" style={{ maxWidth: 520 }}>
        <path d={arc(-80, 80, 130)} stroke="#4a4a4a" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={arc(p.target - p.half, p.target + p.half, 130)} stroke="#B56654" strokeWidth="16" fill="none" />
        <line x1="150" y1="150" x2={nx} y2={ny} stroke="#F4F1EC" strokeWidth="4" strokeLinecap="round" />
        <circle cx="150" cy="150" r="9" fill="#B9986A" />
        <text x="150" y="182" textAnchor="middle" fill="#B9986A" fontFamily="monospace" fontSize="10" letterSpacing="2">TAP TO LOCK THE NEEDLE</text>
      </svg>
      <div style={{ minHeight: 36, fontSize: "1.4rem", fontFamily: "var(--serif)" }}>{flash}</div>
    </div>
  );
}
