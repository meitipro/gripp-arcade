"use client";
import { useEffect, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import { SQUADS } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { GameProps } from "./types";
import { useFrame } from "./util";

const DUR = 30;
export default function RegionRally({ seed, onReady, onProgress, onFinish }: GameProps) {
  const s = useStore();
  const mine = s.profile?.squad ?? "GL";
  const rival = useRef(SQUADS.filter((q) => q.code !== mine)[Math.floor(mulberry32(seed)() * 11)]);
  const st = useRef({ t: 0, taps: 0, bucket: 0, sec: 0, us: 0, them: 0, over: false });
  const rr = useRef(mulberry32(seed ^ 0x77));
  const log = useRef<number[]>([]);
  const [, f] = useState(0);
  useEffect(() => { onReady(); }, [onReady]);
  useFrame((dt) => {
    const x = st.current; if (x.over) return;
    x.t += dt; const sec = Math.floor(x.t);
    if (sec !== x.sec) { x.sec = sec; x.bucket = 0; }
    x.them += (5 + rr.current() * 6) * dt * 1.1;      // simulated rival squad (normalized)
    x.us += (4 + rr.current() * 5) * dt;               // simulated squad mates
    if (x.t >= DUR) { x.over = true; onFinish({ score: x.taps, log: log.current }); }
  });
  const tap = () => {
    const x = st.current; if (x.over) return;
    if (x.bucket >= 8) return;                         // 8 taps per second cap
    x.bucket++; x.taps++; x.us += 1; log.current.push(Math.round(x.t * 1000)); onProgress?.(x.taps); f((n) => n + 1);
  };
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); tap(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  const x = st.current; const total = x.us + x.them || 1; const pct = (x.us / total) * 100;
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>{mine} vs {rival.current.code} · {Math.max(0, Math.ceil(DUR - x.t))}s · your taps {x.taps}</div>
      <div style={{ height: 22, background: "#444", borderRadius: 11, margin: "14px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#B56654" }} /><div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "#F4F1EC" }} />
      </div>
      <button className="pad" style={{ maxWidth: 260, margin: "0 auto", fontSize: "1.6rem" }} onPointerDown={tap}>TAP!</button>
      <div className="mono" style={{ marginTop: 8 }}>{x.over ? (pct >= 55 ? "Your squad won the rope!" : "Rival pulled harder. Run it back.") : "Space or tap. Max 8 per second."}</div>
    </div>
  );
}
