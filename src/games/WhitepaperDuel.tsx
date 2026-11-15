"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, shuffle } from "@/lib/rng";
import type { GameProps } from "./types";

const Q: { q: string; a: string[]; c: number }[] = [
  { q: "What does teleoperation mean?", a: ["A robot controlled remotely by a person", "A robot that thinks alone", "A battery type", "A camera lens"], c: 0 },
  { q: "Which problem makes remote control hard?", a: ["Latency", "Gravity", "Paint", "Humidity only"], c: 0 },
  { q: "What is an end effector?", a: ["The tool at the end of an arm", "A power cable", "A wheel brake", "A software license"], c: 0 },
  { q: "What does a gripper do?", a: ["Holds objects", "Measures heat", "Charges the battery", "Stores video"], c: 0 },
  { q: "What is LiDAR used for?", a: ["Measuring distance with light", "Playing sound", "Cooling motors", "Printing parts"], c: 0 },
  { q: "What is a servo?", a: ["A motor that moves to a set position", "A type of wire", "A map format", "A camera filter"], c: 0 },
  { q: "Which data helps train a robot to copy a task?", a: ["Demonstrations by operators", "Random noise only", "Weather reports", "Phone contacts"], c: 0 },
  { q: "What does DOF stand for in robotics?", a: ["Degrees of freedom", "Digital output format", "Drive on failure", "Dual optic focus"], c: 0 },
  { q: "What is calibration?", a: ["Adjusting a sensor or joint to be accurate", "Painting a robot", "Deleting data", "Speeding a video"], c: 0 },
  { q: "Why do operators watch quality of a demonstration?", a: ["Clean data trains better models", "To make videos longer", "To change colors", "No reason"], c: 0 },
  { q: "What is path planning?", a: ["Finding a safe route to a goal", "Naming a robot", "Choosing a logo", "Recording audio"], c: 0 },
  { q: "What is a policy in robot learning?", a: ["A function from observation to action", "A legal text", "A battery rule", "A warranty"], c: 0 },
  { q: "What does a camera give a remote operator?", a: ["A view of the robot's scene", "Extra torque", "More battery", "A safer floor"], c: 0 },
  { q: "Why use a safe stop (e-stop) on a robot?", a: ["To halt motion immediately when needed", "To save video", "To tune colors", "To change language"], c: 0 },
  { q: "What is a depth camera good for?", a: ["Estimating distance to objects", "Cooling a motor", "Charging faster", "Compressing audio"], c: 0 },
  { q: "What does a gripper force sensor help prevent?", a: ["Crushing fragile objects", "Slow Wi-Fi", "Dim lighting", "Typing errors"], c: 0 },
  { q: "What is a dataset split used for?", a: ["Separating training from testing", "Making files smaller", "Painting charts", "Naming robots"], c: 0 },
  { q: "What is a simulator for?", a: ["Testing robot ideas safely and cheaply", "Charging batteries", "Replacing every real test", "Sorting email"], c: 0 },
  { q: "What is a sampling rate?", a: ["How often a sensor reading is taken", "How loud a motor is", "How many robots exist", "A kind of gear"], c: 0 },
  { q: "What is jitter?", a: ["Variation in delay", "A kind of gear", "A gripper finger", "A coating"], c: 0 },
];
const T = 15;
export default function WhitepaperDuel({ seed, onReady, onProgress, onFinish }: GameProps) {
  const qs = useMemo(() => {
    const r = mulberry32(seed);
    return shuffle(r, Q).slice(0, 8).map((q) => { const order = shuffle(r, [0, 1, 2, 3]); return { q: q.q, a: order.map((i) => q.a[i]), c: order.indexOf(q.c) }; });
  }, [seed]);
  const bot = useMemo(() => { const r = mulberry32(seed ^ 0x55); return qs.map(() => ({ ok: r() < 0.62, t: 3 + r() * 9 })); }, [seed, qs]);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(T);
  const [sel, setSel] = useState<number | null>(null);
  const me = useRef(0); const them = useRef(0);
  const [, force] = useState(0);
  const log = useRef<{ q: number; a: number; t: number }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => {
    if (sel !== null) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, +(l - 0.1).toFixed(1))), 100);
    return () => clearInterval(id);
  }, [sel, i]);
  useEffect(() => { if (left <= 0 && sel === null) answer(-1); });
  function answer(k: number) {
    if (sel !== null) return;
    setSel(k);
    const right = k === qs[i].c;
    if (right) me.current += 100 + Math.round(50 * (left / T));
    const b = bot[i]; if (b.ok) them.current += 100 + Math.round(50 * Math.max(0, (T - b.t) / T));
    log.current.push({ q: i, a: k, t: Math.round((T - left) * 1000) });
    onProgress?.(me.current); force((n) => n + 1);
  }
  const next = () => { if (i + 1 >= qs.length) onFinish({ score: me.current, log: log.current }); else { setI(i + 1); setSel(null); setLeft(T); } };
  const q = qs[i];
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="row sp mono" style={{ color: "#B9986A" }}><span>Q {i + 1}/{qs.length}</span><span>YOU {me.current} · BOT {them.current}</span><span>{left.toFixed(0)}s</span></div>
      <div className="bar" style={{ margin: "8px 0", background: "#444" }}><i style={{ width: `${(left / T) * 100}%` }} /></div>
      <h3 style={{ color: "#F4F1EC" }}>{q.q}</h3>
      <div className="grid" style={{ gap: 8 }}>
        {q.a.map((a, k) => (
          <button key={k} className="tile" style={{ padding: 14, textAlign: "start", background: sel !== null ? (k === q.c ? "#5f7f5a" : k === sel ? "#8a4a3d" : "#2d2d2d") : "#2d2d2d" }} onClick={() => answer(k)} disabled={sel !== null}>{"ABCD"[k]}. {a}</button>
        ))}
      </div>
      {sel !== null && <div style={{ marginTop: 12 }}><p className="mono">{sel === q.c ? "Correct" : sel === -1 ? "Time up" : "Not quite"} · bot {bot[i].ok ? "got it" : "missed"}</p><button className="btn" onClick={next}>{i + 1 >= qs.length ? (me.current > them.current ? "You win · Finish" : "Finish") : "Next"}</button></div>}
    </div>
  );
}
