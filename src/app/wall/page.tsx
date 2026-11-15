"use client";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { sampleMembers } from "@/lib/members";
import { levelFor, tierFor } from "@/lib/points";
import { totalHp, update, useStore } from "@/lib/store";

export default function Page() {
  const s = useStore();
  const base = useMemo(() => sampleMembers(), []);
  const [open, setOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const me = s.profile?.handle ?? "you";
  const all = [{ handle: me, hp: totalHp(s), squad: s.profile?.squad ?? "GL", serial: s.profile?.serial ?? 1, streak: 0, joined: "NOV 2026" }, ...base];
  const shown = all.slice(0, page * 36);
  const sel = all.find((m) => m.handle === open);
  const visit = (h: string) => { setOpen(h); if (h !== me) update((x) => (x.visits.includes(h) ? x : { ...x, visits: [...x.visits, h] })); };
  return (
    <div className="wrap"><section className="block">
      <h1>Wall of Amplifiers</h1>
      <p className="muted">Every member is a face. Robot portraits by default, and photos only with an opt in. Open a mini card to visit it (the Wall tour quest counts these).</p>
      <div className="row sp"><span className="mono">{all.length} faces · {s.visits.length} visited</span>
        <label className="row"><input type="checkbox" checked={s.profile?.face === "photo"} onChange={(e) => update((x) => ({ ...x, profile: x.profile && { ...x.profile, face: e.target.checked ? "photo" : "robot" } }))} /> <span className="mono">Photo opt in (not available in demo; robot is used)</span></label></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(84px,1fr))", gap: 10, margin: "16px 0" }}>
        {shown.map((m) => (
          <button key={m.handle} onClick={() => visit(m.handle)} aria-label={`Open card for ${m.handle}`} style={{ border: m.handle === me ? "2px solid var(--bronze)" : "1px solid var(--cream)", borderRadius: 14, background: "var(--panel)", padding: 6, cursor: "pointer", display: "grid", justifyItems: "center", gap: 4 }}>
            <Avatar handle={m.handle} size={56} /><span className="mono" style={{ fontSize: ".72rem", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.handle}</span></button>))}
      </div>
      {shown.length < all.length && <button className="btn alt" onClick={() => setPage(page + 1)}>Load more</button>}
      {sel && (
        <div className="panel dark" role="dialog" aria-label="Mini card" style={{ position: "fixed", inset: "auto 16px 16px 16px", maxWidth: 420, margin: "0 auto", zIndex: 30 }}>
          <div className="row sp"><div className="row"><Avatar handle={sel.handle} size={56} /><div><b>@{sel.handle}</b><div className="mono" style={{ color: "var(--gold)" }}>Tier {tierFor(sel.hp).roman} {tierFor(sel.hp).name} · LV {levelFor(Math.floor(sel.hp * 1.1))} · {sel.squad}</div></div></div>
            <button className="chip" style={{ color: "#F4F1EC", borderColor: "#F4F1EC" }} onClick={() => setOpen(null)}>Close</button></div>
          {sel.handle !== me && <a className="chip" style={{ color: "#F4F1EC", borderColor: "#B9986A" }} href={`/card/${sel.handle}`}>Full card</a>}<p className="note" style={{ color: "#DFD8D0" }}>{sel.hp.toLocaleString()} Hub Points · Serial No. {String(sel.serial).padStart(4, "0")}. Sample members are placeholders, not real people.</p>
        </div>)}
    </section></div>
  );
}
