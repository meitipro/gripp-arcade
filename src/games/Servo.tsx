"use client";
import { useEffect, useRef, useState } from "react";
import type { GameProps } from "./types";

type Res = ("g" | "y" | "x")[];
const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const SYM = { g: "●", y: "◐", x: "○" } as const;

/** Servo is the one game that asks the server: the answer never ships to the browser, only per-letter results. */
export default function Servo({ seed, mode, onReady, onProgress, onFinish }: GameProps) {
  const [guesses, setGuesses] = useState<{ w: string; r: Res }[]>([]);
  const [cur, setCur] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const t0 = useRef(Date.now());
  const practice = mode === "practice" ? seed : undefined;
  useEffect(() => { onReady(); }, [onReady]);

  const submit = async () => {
    if (busy || over || cur.length !== 5) { if (cur.length !== 5) setMsg("Five letters"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/servo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guess: cur, row: guesses.length, practice }) });
      const j = await r.json();
      if (!j.valid) { setMsg(j.error || "Not a word"); setBusy(false); return; }
      const next = [...guesses, { w: cur, r: j.result as Res }];
      setGuesses(next); setCur(""); setMsg("");
      if (j.won || next.length >= 6) {
        setOver(true);
        const n = next.length;
        const bonus = Math.max(0, Math.round(100 - (Date.now() - t0.current) / 3000));
        const score = j.won ? 1000 - 150 * (n - 1) + Math.min(100, bonus) : 0;
        onProgress?.(score);
        if (!j.won && j.answer) setMsg(`The word was ${String(j.answer).toUpperCase()}`);
        const grid = next.map((g) => g.r.map((c) => (c === "g" ? "🟩" : c === "y" ? "🟨" : "⬛")).join("")).join(String.fromCharCode(10));
        try { navigator.clipboard?.writeText("Gripp Arcade Servo " + (j.won ? n : "X") + "/6" + String.fromCharCode(10) + grid); } catch {}
        setTimeout(() => onFinish({ score, log: next.map((g) => g.w) }), 1400);
      }
    } catch { setMsg("Offline. Try again."); }
    setBusy(false);
  };
  const press = (k: string) => {
    if (over) return;
    if (k === "ENTER") return void submit();
    if (k === "BACK") return setCur((c) => c.slice(0, -1));
    if (cur.length < 5) setCur((c) => c + k.toLowerCase());
  };
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (e.key === "Enter") press("ENTER"); else if (e.key === "Backspace") press("BACK"); else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
    };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  });
  const status: Record<string, string> = {};
  for (const g of guesses) g.w.split("").forEach((ch, i) => { const c = g.r[i]; if (c === "g" || (c === "y" && status[ch] !== "g") || (!status[ch])) status[ch] = c; });
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>{mode === "ranked" ? "Daily word" : "Practice word"} · green ● right place · gold ◐ wrong place</div>
      <div style={{ display: "grid", gap: 6, justifyContent: "center", margin: "12px 0" }} aria-live="polite">
        {Array.from({ length: 6 }, (_, row) => {
          const g = guesses[row]; const active = row === guesses.length;
          return (<div key={row} style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 5 }, (_, i) => {
              const ch = g ? g.w[i] : active ? cur[i] : "";
              return <div key={i} className={"cell " + (g ? g.r[i] : "")} aria-label={g ? `${ch} ${g.r[i] === "g" ? "correct" : g.r[i] === "y" ? "present" : "absent"}` : undefined}>{ch}{g && <sup style={{ fontSize: ".5rem" }}>{SYM[g.r[i]]}</sup>}</div>;
            })}
          </div>);
        })}
      </div>
      <div style={{ minHeight: 24 }} className="mono">{msg}</div>
      <div className="kbd">
        {ROWS.map((r, i) => (
          <div key={r}>
            {i === 2 && <button className="key" style={{ maxWidth: 64 }} onClick={() => press("ENTER")}>↵</button>}
            {r.split("").map((k) => <button key={k} className="key" style={{ background: status[k.toLowerCase()] === "g" ? "#5f7f5a" : status[k.toLowerCase()] === "y" ? "#B9986A" : status[k.toLowerCase()] === "x" ? "#555" : undefined, color: status[k.toLowerCase()] === "x" ? "#aaa" : "#202020" }} onClick={() => press(k)}>{k}</button>)}
            {i === 2 && <button className="key" style={{ maxWidth: 64 }} onClick={() => press("BACK")}>⌫</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
