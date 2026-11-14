"use client";
import { useState } from "react";
import { gameById } from "@/lib/catalog";
import { releaseRun, reverseRun, update, useStore } from "@/lib/store";

/** Local staff console. In a hosted build this sits behind role based access; here it manages this device's data. */
export default function Page() {
  const s = useStore();
  const [reason, setReason] = useState("");
  const [audit, setAudit] = useState<{ ts: number; action: string; reason: string }[]>([]);
  const log = (action: string) => setAudit((a) => [{ ts: Date.now(), action, reason: reason || "(no reason)" }, ...a]);
  return (
    <div className="wrap"><section className="block">
      <h1>Staff console</h1>
      <p className="note">Local demo of the moderation tools: hold, release and reverse runs with an audit entry, freeze the wall in one click, and a reports queue. Role based access arrives with the hosted database.</p>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="row sp"><h3 style={{ margin: 0 }}>Pixel Wall</h3>
          <button className={"btn " + (s.frozen ? "bronze" : "alt")} onClick={() => { update((x) => ({ ...x, frozen: !x.frozen })); log(s.frozen ? "unfreeze wall" : "freeze wall"); }}>{s.frozen ? "Unfreeze the wall" : "Freeze the wall"}</button></div></div>
      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Last 50 runs</h3>
        <label className="label" htmlFor="r">Reason for audit log</label><br /><input id="r" type="text" value={reason} onChange={(e) => setReason(e.target.value)} style={{ margin: "6px 0 12px", width: "100%", maxWidth: 360 }} />
        <div style={{ overflowX: "auto" }}><table className="t"><thead><tr><th>When</th><th>Game</th><th>Score</th><th>HP</th><th>Status</th><th></th></tr></thead>
          <tbody>{s.runs.slice(0, 50).map((r) => (
            <tr key={r.id}><td className="mono">{new Date(r.ts).toLocaleString()}</td><td>{gameById(r.game)?.name}{r.ranked ? "" : " (practice)"}</td><td>{r.score.toLocaleString()}</td><td>{r.hp}</td><td>{r.status}</td>
              <td>{r.status === "held" && <button className="chip" onClick={() => { update((x) => releaseRun(x, r.id)); log(`release ${r.id}`); }}>Release</button>}{r.ranked && r.status === "counted" && <button className="chip" onClick={() => { update((x) => reverseRun(x, r.id)); log(`reverse ${r.id}`); }}>Reverse</button>}</td></tr>))}
            {!s.runs.length && <tr><td colSpan={6} className="muted">No runs yet.</td></tr>}</tbody></table></div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}><h3>Audit log</h3>{audit.length ? audit.map((a, i) => <div key={i} className="mono" style={{ padding: "4px 0" }}>{new Date(a.ts).toLocaleTimeString()} · {a.action} · {a.reason}</div>) : <p className="muted">No actions yet this session.</p>}</div>
      <div className="panel" style={{ marginTop: 16 }}><h3>Reports queue</h3><p className="muted">{s.reports.length ? `${s.reports.length} open` : "Empty. Members can report content from the wall and captions once a hosted database is connected."}</p></div>
    </section></div>
  );
}
