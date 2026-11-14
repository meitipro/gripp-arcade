"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, shuffle } from "@/lib/rng";
import { sampleMembers } from "@/lib/members";
import { levelFor, tierFor } from "@/lib/points";
import { Avatar } from "@/components/Avatar";
import type { GameProps } from "./types";

const STEP = 6;
export default function GuessAmplifier({ seed, onReady, onProgress, onFinish }: GameProps) {
  const rounds = useMemo(() => {
    const r = mulberry32(seed); const all = sampleMembers();
    return Array.from({ length: 10 }, () => {
      const opts = shuffle(r, all).slice(0, 4); const ans = opts[Math.floor(r() * 4)];
      return { ans, opts };
    });
  }, [seed]);
  const [i, setI] = useState(0);
  const [clues, setClues] = useState(1);
  const [res, setRes] = useState<null | { ok: boolean; pts: number }>(null);
  const score = useRef(0);
  const log = useRef<{ round: number; clues: number; pick: string }[]>([]);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => { if (res) return; const id = setInterval(() => setClues((c) => Math.min(5, c + 1)), STEP * 1000); return () => clearInterval(id); }, [i, res]);
  const m = rounds[i].ans;
  const all = [`Squad ${m.squad}`, `Tier ${tierFor(m.hp).name}`, `Level ${levelFor(Math.floor(m.hp * 1.1))}`, `Streak ${m.streak} days`, `Card serial No. ${String(m.serial).padStart(4, "0")}`];
  const pick = (h: string) => {
    if (res) return;
    const ok = h === m.handle; const pts = ok ? 100 - 20 * (clues - 1) : 0;
    score.current += pts; onProgress?.(score.current); log.current.push({ round: i, clues, pick: h }); setRes({ ok, pts });
  };
  const next = () => { if (i + 1 >= rounds.length) onFinish({ score: score.current, log: log.current }); else { setI(i + 1); setClues(1); setRes(null); } };
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <div className="mono" style={{ color: "#B9986A" }}>ROUND {i + 1}/10 · a new clue every {STEP}s · {100 - 20 * (clues - 1)} pts now</div>
      <div className="panel dark" style={{ margin: "12px 0", border: "1px solid #B9986A", textAlign: "start" }}>
        <div className="label">Whose card is this?</div>
        {all.slice(0, clues).map((c) => <div key={c} style={{ fontFamily: "var(--serif)", fontSize: "1.1rem" }}>• {c}</div>)}
        <button className="chip" style={{ marginTop: 8, color: "#F4F1EC", borderColor: "#B9986A" }} disabled={clues >= 5 || !!res} onClick={() => setClues(clues + 1)}>Next clue (−20)</button>
      </div>
      <div className="grid g4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {rounds[i].opts.map((o) => (
          <button key={o.handle} className="tile" onClick={() => pick(o.handle)} disabled={!!res} style={{ padding: 10, display: "flex", gap: 10, alignItems: "center", background: res ? (o.handle === m.handle ? "#5f7f5a" : "#2d2d2d") : "#2d2d2d" }}>
            <Avatar handle={o.handle} size={44} /><span style={{ fontSize: ".8rem" }}>@{o.handle}</span>
          </button>))}
      </div>
      {res && <div style={{ marginTop: 12 }}><p>{res.ok ? `Yes! +${res.pts}` : `It was @${m.handle}`}</p><button className="btn" onClick={next}>{i + 1 >= rounds.length ? "Finish" : "Next"}</button></div>}
      <p className="note" style={{ color: "#DFD8D0" }}>Only sample members drawn from public card data. No real people.</p>
    </div>
  );
}
