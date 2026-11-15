"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, shuffle } from "@/lib/rng";
import { SAMPLE_HANDLES } from "@/lib/members";
import { getState, update } from "@/lib/store";
import { Character } from "@/components/Cast";
import type { GameProps } from "./types";

const SCENES = [
  { alt: "A robot arm holds a single grape and hesitates over a bowl.", art: ["Gripp"] },
  { alt: "Two small robots argue over the last battery.", art: ["Moss", "Dot"] },
  { alt: "A gripper shakes hands with a very surprised visitor.", art: ["Gripp", "Lumen"] },
] as const;
const SAMPLE_CAPS = ["It said gently. It did not move.", "Wide eyes, wider budget.", "Calibrating my expectations.", "Please insert coffee.", "I only dropped it twice.", "Latency is a state of mind.", "One does not simply home --all.", "Plot twist: the grape was the operator.", "Proof of concept, proof of grape."];
const BAD = /\b(hate|kill|idiot|stupid)\b/i;
export default function CaptionBench({ seed, onReady, onProgress, onFinish }: GameProps) {
  const scene = SCENES[seed % SCENES.length];
  const others = useMemo(() => { const r = mulberry32(seed); return shuffle(r, SAMPLE_CAPS).slice(0, 6).map((text, i) => ({ text, by: SAMPLE_HANDLES[Math.floor(r() * 60)], votes: Math.floor(r() * 90) + i })); }, [seed]);
  const [text, setText] = useState("");
  const [mine, setMine] = useState<string | null>(null);
  const [voted, setVoted] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const score = useRef(0);
  const log = useRef<unknown[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  const submit = () => {
    const t = text.trim();
    if (!t) return setErr("Write something"); if (t.length > 80) return setErr("80 characters max"); if (BAD.test(t)) return setErr("Please keep it kind. This caption was blocked by the filter.");
    update((s) => ({ ...s, captions: [...s.captions, { scene: seed % SCENES.length, text: t, votes: 0 }].slice(-50) }));
    setMine(t); score.current += 10; onProgress?.(score.current); log.current.push({ caption: t }); setErr("");
  };
  const vote = (t: string) => { if (voted.includes(t) || voted.length >= 10 || t === mine) return; setVoted([...voted, t]); score.current += 3; onProgress?.(score.current); log.current.push({ vote: t }); };
  const pool = [...others.map((o) => ({ ...o })), ...(mine ? [] : [])];
  void getState;
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="mono" style={{ color: "#B9986A" }}>THIS WEEK&apos;S IMAGE</div>
      <div style={{ background: "#151515", borderRadius: 12, padding: 16, textAlign: "center", margin: "8px 0" }}>
        <div className="row" style={{ justifyContent: "center", gap: 24 }} aria-hidden>{scene.art.map((n) => <Character key={n} name={n} size={84} />)}</div><div className="muted" style={{ color: "#DFD8D0", fontSize: ".85rem" }}>{scene.alt}</div>
      </div>
      {!mine ? (
        <div className="row"><input type="text" maxLength={80} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your caption…" aria-label="Caption" style={{ flex: 1 }} /><button className="btn" onClick={submit}>Submit</button></div>
      ) : <p className="mono">Your caption: “{mine}” (+10)</p>}
      {err && <p className="note" style={{ color: "#d97a66" }}>{err}</p>}
      <div className="mono" style={{ margin: "12px 0 6px", color: "#B9986A" }}>VOTE ({voted.length}/10) · +3 each</div>
      {pool.map((c) => (
        <div key={c.text} className="row sp" style={{ borderBottom: "1px solid #444", padding: "8px 0" }}>
          <div><div>{c.text}</div><div className="mono" style={{ color: "#888" }}>@{c.by} · {c.votes + (voted.includes(c.text) ? 1 : 0)} votes</div></div>
          <button className="chip" style={{ color: "#F4F1EC", borderColor: "#F4F1EC" }} disabled={voted.includes(c.text) || voted.length >= 10} onClick={() => vote(c.text)}>{voted.includes(c.text) ? "Voted" : "Vote"}</button>
        </div>))}
      <p><button className="btn" onClick={() => onFinish({ score: score.current, log: log.current })} disabled={!mine}>Finish ({score.current} points)</button></p>
    </div>
  );
}
