"use client";
import { PageHead } from "@/components/PageHead";
import { useState } from "react";
import { resetAll, update, useStore } from "@/lib/store";
import { SQUADS } from "@/lib/catalog";
import { cleanHandle } from "@/lib/card";

export default function Page() {
  const s = useStore();
  const p = s.profile;
  const [handle, setHandle] = useState("");
  const [msg, setMsg] = useState("");
  if (!p) return <div className="wrap"><p>Loading…</p></div>;
  const set = (patch: Partial<typeof p>) => update((x) => ({ ...x, profile: x.profile && { ...x.profile, ...patch } }));
  const saveHandle = () => { const h = cleanHandle(handle); if (h.length < 2) return setMsg("2 to 24 letters, numbers, dot, dash or underscore"); set({ handle: h }); setMsg("Saved"); setHandle(""); };
  return (
    <div className="wrap"><section className="block" style={{ maxWidth: 640 }}>
      <PageHead kicker="You" title="Settings" />
      <div className="panel grid">
        <div><label className="label" htmlFor="h">Handle</label><div className="row"><input id="h" type="text" placeholder={p.handle} value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={24} /><button className="btn" onClick={saveHandle}>Save</button></div><p className="note" role="status">{msg || "Your public name. No email or real name is needed."}</p></div>
        <div><label className="label" htmlFor="l">Language</label><br /><select id="l" value={p.locale} onChange={(e) => set({ locale: e.target.value as "en" | "fa" })}><option value="en">English</option><option value="fa">فارسی (right to left)</option></select></div>
        <div><label className="label" htmlFor="sq">Squad</label><br /><select id="sq" value={p.squad} onChange={(e) => set({ squad: e.target.value })}>{SQUADS.map((q) => <option key={q.code} value={q.code}>{q.code} · {q.name}</option>)}</select></div>
        <label className="row"><input type="checkbox" defaultChecked={typeof window !== "undefined" && localStorage.getItem("gripp-mute") === "1"} onChange={(e) => { try { localStorage.setItem("gripp-mute", e.target.checked ? "1" : "0"); } catch {} }} /> Mute game sounds</label>
        <label className="row"><input type="checkbox" checked={p.calm} onChange={(e) => set({ calm: e.target.checked })} /> Calm mode: no animation, slower games</label>
      </div>
      <div className="panel" style={{ marginTop: 16 }}><h2 style={{ fontSize: "1.4rem" }}>Your data</h2><p className="muted">Everything lives in this browser only: handle, runs, points and wall tiles. Nothing else is stored.</p>
        <button className="btn alt" onClick={() => { if (confirm("Delete all your runs, points, card and wall tiles on this device?")) { resetAll(); location.href = "/"; } }}>Delete everything</button></div>
    </section></div>
  );
}
