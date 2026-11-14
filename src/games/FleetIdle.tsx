"use client";
import { useEffect, useRef, useState } from "react";
import { getState, update, useStore } from "@/lib/store";
import type { GameProps } from "./types";

const UP = [
  { name: "Better servos", base: 1.0, cost: 20 }, { name: "Cable routing", base: 2.5, cost: 90 }, { name: "Night shift", base: 6, cost: 400 },
  { name: "Spare gripper", base: 14, cost: 1600 }, { name: "Firmware update", base: 35, cost: 7000 }, { name: "Second fleet", base: 90, cost: 30000 },
];
const cost = (i: number, lvl: number) => Math.floor(UP[i].cost * Math.pow(1.55, lvl));
export const rateOf = (lvl: number[]) => 0.5 + lvl.reduce((a, l, i) => a + UP[i].base * Math.pow(l, 0.85), 0);  // diminishing returns

export default function FleetIdle({ onReady, onProgress, onFinish }: GameProps) {
  const s = useStore();
  const [earnedVisit, setEarnedVisit] = useState(0);
  const [offline, setOffline] = useState(0);
  const init = useRef(false);
  useEffect(() => {
    onReady();
    if (init.current) return; init.current = true;
    const st = getState();
    const now = Date.now(); const last = st.fleet.last || now;
    const secs = Math.min(8 * 3600, Math.max(0, (now - last) / 1000));      // offline earnings capped at 8 hours
    const gain = Math.floor(secs * rateOf(st.fleet.lvl));
    setOffline(gain); setEarnedVisit(gain); onProgress?.(gain);
    update((x) => ({ ...x, fleet: { ...x.fleet, scrap: x.fleet.scrap + gain, last: now } }));
  }, [onReady, onProgress]);
  useEffect(() => {
    const id = setInterval(() => {
      const r = rateOf(getState().fleet.lvl);
      update((x) => ({ ...x, fleet: { ...x.fleet, scrap: x.fleet.scrap + r, last: Date.now() } }));
      setEarnedVisit((e) => { const n = e + r; onProgress?.(Math.floor(n)); return n; });
    }, 1000);
    return () => clearInterval(id);
  }, [onProgress]);
  const buy = (i: number) => update((x) => { const c = cost(i, x.fleet.lvl[i]); if (x.fleet.scrap < c) return x; const lvl = x.fleet.lvl.slice(); lvl[i]++; return { ...x, fleet: { ...x.fleet, scrap: x.fleet.scrap - c, lvl } }; });
  const f = s.fleet;
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="row sp"><div><div className="label" style={{ color: "#B9986A" }}>Scrap</div><div className="stat">{Math.floor(f.scrap).toLocaleString()}</div></div><div style={{ textAlign: "end" }}><div className="label" style={{ color: "#B9986A" }}>Per second</div><div className="stat">{rateOf(f.lvl).toFixed(1)}</div></div></div>
      {offline > 0 && <p className="mono" style={{ color: "#B9986A" }}>While you were away: +{offline.toLocaleString()} scrap (max 8 hours)</p>}
      <div style={{ margin: "12px 0" }}>
        {UP.map((u, i) => { const c = cost(i, f.lvl[i]); return (
          <div key={u.name} className="row sp" style={{ borderBottom: "1px solid #444", padding: "8px 0" }}>
            <div>{u.name} <span className="mono" style={{ color: "#B9986A" }}>Lv {f.lvl[i]}</span></div>
            <button className="chip" style={{ color: "#F4F1EC", borderColor: "#F4F1EC" }} disabled={f.scrap < c} onClick={() => buy(i)}>Upgrade · {c.toLocaleString()}</button>
          </div>); })}
      </div>
      <p className="note" style={{ color: "#DFD8D0" }}>Nothing here can be bought with money. Scrap is just a game number.</p>
      <button className="btn" onClick={() => onFinish({ score: Math.floor(earnedVisit), log: [] })}>Bank this visit ({Math.floor(earnedVisit).toLocaleString()} scrap)</button>
    </div>
  );
}
