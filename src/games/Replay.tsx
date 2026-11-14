"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32 } from "@/lib/rng";
import type { GameProps } from "./types";
import { beep } from "./util";

const TOOLS = ["BASE", "SHOULDER", "ELBOW", "CLAW"];
const TONES = [262, 330, 392, 523];
export default function Replay({ seed, onReady, onProgress, onFinish }: GameProps) {
  const seq = useMemo(() => { const r = mulberry32(seed); return Array.from({ length: 60 }, () => Math.floor(r() * 4)); }, [seed]);
  const [round, setRound] = useState(1);        // sequence length = round + 2
  const [phase, setPhase] = useState<"watch" | "echo" | "over">("watch");
  const [lit, setLit] = useState(-1);
  const [pos, setPos] = useState(0);
  const score = useRef(0);
  const log = useRef<{ round: number; inputs: number[] }[]>([]);
  const inputs = useRef<number[]>([]);
  useEffect(() => { onReady(); }, [onReady]);

  useEffect(() => {
    if (phase !== "watch") return;
    const len = round + 2;
    const speed = Math.max(220, 620 - 60 * Math.floor((round - 1) / 5));
    let i = 0; const ids: number[] = [];
    const step = () => {
      if (i >= len) { setLit(-1); setPhase("echo"); setPos(0); inputs.current = []; return; }
      const k = seq[i]; setLit(k); beep(TONES[k], speed * 0.6);
      ids.push(window.setTimeout(() => setLit(-1), speed * 0.65)); i++;
      ids.push(window.setTimeout(step, speed));
    };
    ids.push(window.setTimeout(step, 700));
    return () => ids.forEach(clearTimeout);
  }, [phase, round, seq]);

  const press = (k: number) => {
    if (phase !== "echo") return;
    beep(TONES[k], 120); setLit(k); setTimeout(() => setLit(-1), 140);
    inputs.current.push(k);
    const len = round + 2;
    if (seq[pos] !== k) {
      log.current.push({ round, inputs: inputs.current.slice() });
      setPhase("over"); setTimeout(() => onFinish({ score: score.current, log: log.current }), 800); return;
    }
    if (pos + 1 >= len) {
      score.current += 10 * len + (round % 5 === 0 ? 20 : 0);
      onProgress?.(score.current);
      log.current.push({ round, inputs: inputs.current.slice() });
      setTimeout(() => { setRound((r) => r + 1); setPhase("watch"); }, 500);
      setPhase("over" as never); // lock input during pause
      setTimeout(() => setPhase("watch"), 500);
    } else setPos(pos + 1);
  };
  useEffect(() => {
    const f = (e: KeyboardEvent) => { const i = ["1", "2", "3", "4"].indexOf(e.key); if (i >= 0) press(i); };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  });
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>Round {round} · {phase === "watch" ? "WATCH" : phase === "echo" ? "YOUR TURN" : ""}</div>
      <div className="grid g4" style={{ maxWidth: 520, margin: "16px auto", gridTemplateColumns: "repeat(2, 1fr)" }}>
        {TOOLS.map((t, i) => <button key={t} className={"pad" + (lit === i ? " lit" : "")} onClick={() => press(i)} aria-label={`${t} (key ${i + 1})`}>{t}<span className="mono" style={{ display: "block", fontSize: ".6rem" }}>{i + 1}</span></button>)}
      </div>
      <div className="mono">{phase === "echo" ? `${pos} / ${round + 2}` : ""}</div>
    </div>
  );
}
