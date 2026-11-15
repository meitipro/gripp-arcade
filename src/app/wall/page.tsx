"use client";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PageHead } from "@/components/PageHead";
import { SQUADS } from "@/lib/catalog";
import { sampleMembers } from "@/lib/members";
import { floorPath } from "@/lib/motifs";
import { levelFor, tierFor, warScore } from "@/lib/points";
import { totalHp, update, useStore, weekKey } from "@/lib/store";

export default function Page() {
  const s = useStore();
  const members = useMemo(() => sampleMembers(), []);
  const me = s.profile?.handle ?? "you";
  const mine = s.profile?.squad ?? "GL";
  const [selCode, setSelCode] = useState<string>(mine);
  const [open, setOpen] = useState<string | null>(null);
  const floor = useMemo(() => floorPath(700, 140, 14, 8), []);
  const weekStart = new Date(weekKey(Date.now())).getTime();
  const myWeek = s.ledger.filter((r) => r.ts >= weekStart && r.amount > 0).reduce((a, r) => a + r.amount, 0);

  const rows = useMemo(() => SQUADS.map((q) => {
    const pts = members.filter((m) => m.squad === q.code).map((m) => Math.floor(m.hp / 12));
    if (q.code === mine) pts.push(myWeek);
    return { ...q, war: warScore(pts) };
  }).sort((a, b) => b.war - a.war), [members, mine, myWeek]);
  const top = rows[0].war || 1;
  const selIx = Math.max(0, rows.findIndex((r) => r.code === selCode));
  const sel = rows[selIx];

  // faces for the selected squad: its sample members first, then fill from the rest so the grid is never thin
  const faces = useMemo(() => {
    const own = members.filter((m) => m.squad === sel.code);
    const rest = members.filter((m) => m.squad !== sel.code);
    const k = SQUADS.findIndex((q) => q.code === sel.code);
    const rot = [...rest.slice(k * 3), ...rest.slice(0, k * 3)];
    const meRow = { handle: me, hp: totalHp(s), squad: mine, serial: s.profile?.serial ?? 1, streak: 0, joined: "NOV 2026" };
    return [...(sel.code === mine ? [meRow] : []), ...own, ...rot].slice(0, 30);
  }, [members, sel.code, mine, me, s]);

  const visit = (h: string) => { setOpen(h); if (h !== me) update((x) => (x.visits.includes(h) ? x : { ...x, visits: [...x.visits, h] })); };
  const detail = open ? (open === me ? { handle: me, hp: totalHp(s), squad: mine, serial: s.profile?.serial ?? 1 } : members.find((m) => m.handle === open)) : null;

  return (
    <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
      <PageHead kicker="Community · Squad war this week" title="Wall of Amplifiers" aside={<p style={{ margin: 0, maxWidth: "36ch", color: "var(--soft)" }}>Every member gets a robot face drawn from their handle. Pick a squad to light up its crest.</p>} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 48, marginTop: 40 }}>
        <section aria-label="Squads" style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="between"><h2 className="disp2" style={{ margin: 0, fontSize: 44 }}>Region <i>war</i></h2><span className="label muted">Top 20% score</span></div>
          <div style={{ borderTop: "1px solid var(--ink)", marginTop: 14 }}>
            {rows.map((q, i) => (
              <button key={q.code} type="button" className="sqrow" aria-pressed={q.code === sel.code} onClick={() => setSelCode(q.code)} style={{ background: q.code === sel.code ? "color-mix(in srgb, var(--cream) 70%, transparent)" : "transparent" }}>
                <span className="label bronze" style={{ width: 28, textAlign: "start" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="label" style={{ width: 34, textAlign: "start" }}>{q.code}</span>
                <span style={{ flex: 1, textAlign: "start", font: "200 22px var(--serif)", letterSpacing: "-.01em" }}>{q.name}{q.code === mine && <span className="label bronze"> · you</span>}</span>
                <span style={{ width: 120, height: 6, background: "var(--cream)", borderRadius: 9, overflow: "hidden", display: "block" }}><span style={{ display: "block", height: "100%", width: `${(q.war / top) * 100}%`, background: q.code === sel.code ? "var(--bronze)" : "var(--ink)" }} /></span>
                <span className="label" style={{ width: 52, textAlign: "end" }}>{q.war.toLocaleString()}</span>
              </button>
            ))}
          </div>
          <p className="note">A squad&apos;s weekly score is the sum of its top 20% of members, so small squads can win and one star cannot carry a team.</p>
        </section>

        <section aria-label="Wall" style={{ flex: "2 1 560px", minWidth: 0 }}>
          <div className="squadbanner">
            <svg viewBox="0 0 700 140" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: "auto 0 0 0", width: "100%", height: "70%" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".2" /></svg>
            <div style={{ position: "relative" }}><div className="label" style={{ color: "#B9986A" }}>Selected squad</div><div className="serif" style={{ font: "200 64px/1 var(--serif)", letterSpacing: "-.035em", marginTop: 8 }}>{sel.name}</div></div>
            <div style={{ position: "relative", display: "flex", border: "1px solid rgba(244,241,236,.3)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 20px" }}><div className="label" style={{ color: "#B9986A" }}>Members</div><div className="serif" style={{ font: "200 34px/1.1 var(--serif)" }}>{sel.members.toLocaleString()}</div></div>
              <div style={{ padding: "12px 20px", borderInlineStart: "1px solid rgba(244,241,236,.2)" }}><div className="label" style={{ color: "#B9986A" }}>War score</div><div className="serif" style={{ font: "200 34px/1.1 var(--serif)" }}>{sel.war.toLocaleString()}</div></div>
              <div style={{ padding: "12px 20px", borderInlineStart: "1px solid rgba(244,241,236,.2)" }}><div className="label" style={{ color: "#B9986A" }}>Rank</div><div className="serif" style={{ font: "200 34px/1.1 var(--serif)" }}>#{selIx + 1}</div></div>
            </div>
            {sel.code !== mine && <button type="button" className="btn paperbtn" style={{ position: "relative" }} onClick={() => update((x) => ({ ...x, profile: x.profile && { ...x.profile, squad: sel.code } }))}>Join {sel.name}</button>}
          </div>
          <div className="facegrid2">
            {faces.map((m) => (
              <button key={m.handle} type="button" className="fc" onClick={() => visit(m.handle)} aria-label={`Open card for ${m.handle}`}>
                <Avatar handle={m.handle} size={56} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--soft)", wordBreak: "break-all" }}>{m.handle}</span>
              </button>
            ))}
          </div>
          <div className="row sp" style={{ marginTop: 16 }}>
            <p className="label muted" style={{ margin: 0 }}>Sample handles. No real person shown. {s.visits.length} cards visited.</p>
            <label className="row"><input type="checkbox" checked={s.profile?.face === "photo"} onChange={(e) => update((x) => ({ ...x, profile: x.profile && { ...x.profile, face: e.target.checked ? "photo" : "robot" } }))} /> <span className="label muted">Photo opt in (robot used in this demo)</span></label>
          </div>
        </section>
      </div>

      {detail && (
        <div className="panel dark" role="dialog" aria-label="Mini card" style={{ position: "fixed", inset: "auto 16px 16px 16px", maxWidth: 420, margin: "0 auto", zIndex: 30 }}>
          <div className="row sp"><div className="row"><Avatar handle={detail.handle} size={56} /><div><b>@{detail.handle}</b><div className="label" style={{ color: "#B9986A" }}>Tier {tierFor(detail.hp).roman} {tierFor(detail.hp).name} · LV {levelFor(Math.floor(detail.hp * 1.1))} · {detail.squad}</div></div></div>
            <button className="chip" style={{ color: "#F4F1EC", borderColor: "#F4F1EC" }} onClick={() => setOpen(null)}>Close</button></div>
          {detail.handle !== me && <a className="chip" style={{ color: "#F4F1EC", borderColor: "#B9986A", marginTop: 10 }} href={`/card/${detail.handle}`}>Full card</a>}
          <p className="note" style={{ color: "#DFD8D0" }}>{detail.hp.toLocaleString()} Hub Points · Serial No. {String(detail.serial).padStart(4, "0")}. Sample members are placeholders, not real people.</p>
        </div>
      )}
    </div>
  );
}
