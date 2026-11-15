"use client";
import { useState } from "react";
import { SQUADS } from "@/lib/catalog";
import { cleanHandle } from "@/lib/card";
import { update, useStore } from "@/lib/store";
import { Character } from "./Cast";

export default function Onboarding() {
  const s = useStore();
  const p = s.profile!;
  const [handle, setHandle] = useState("");
  const [squad, setSquad] = useState(p.squad);
  const [loc, setLoc] = useState<"en" | "fa">(p.locale);
  const [err, setErr] = useState("");
  const go = () => {
    const h = handle ? cleanHandle(handle) : p.handle;
    if (h.length < 2) return setErr("2 to 24 letters, numbers, dot, dash or underscore");
    update((x) => ({ ...x, profile: x.profile && { ...x.profile, handle: h, squad, locale: loc, onboarded: true } }));
  };
  return (
    <div className="modalbg" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="modal">
        <div className="row"><Character name="Gripp" size={72} /><div><div className="label">Welcome, operator</div><h2 style={{ margin: 0 }}>Set up your card</h2></div></div>
        <p className="muted">Pick a public name, a squad and a language. No email, no password, no real name. You can change all of this later.</p>
        <label className="label" htmlFor="ob-h">Handle</label>
        <input id="ob-h" type="text" maxLength={24} placeholder={p.handle} value={handle} onChange={(e) => setHandle(e.target.value)} style={{ width: "100%", margin: "4px 0 12px" }} />
        <div className="row" style={{ marginBottom: 12 }}>
          <div style={{ flex: 1 }}><label className="label" htmlFor="ob-s">Squad</label><br /><select id="ob-s" value={squad} onChange={(e) => setSquad(e.target.value)} style={{ width: "100%" }}>{SQUADS.map((q) => <option key={q.code} value={q.code}>{q.code} · {q.name}</option>)}</select></div>
          <div style={{ flex: 1 }}><label className="label" htmlFor="ob-l">Language</label><br /><select id="ob-l" value={loc} onChange={(e) => setLoc(e.target.value as "en" | "fa")} style={{ width: "100%" }}><option value="en">English</option><option value="fa">فارسی</option></select></div>
        </div>
        {err && <p className="note" role="alert">{err}</p>}
        <p className="note">Hub Points are a community game score, not an official PrismaX reward. Everything stays on this device.</p>
        <button className="btn bronze" onClick={go} style={{ width: "100%" }}>Start playing</button>
      </div>
    </div>
  );
}

