"use client";
import { useState } from "react";
import { CardView } from "@/components/CardView";
import { cardSvg } from "@/lib/card";
import { memberCard, streakOf, totalHp, update, useStore } from "@/lib/store";
import { BADGES, QUESTS } from "@/lib/catalog";
import { TIERS, tierFor } from "@/lib/points";

export default function Page() {
  const s = useStore();
  const [msg, setMsg] = useState("");
  const data = memberCard(s);
  const hp = totalHp(s);
  const download = () => {
    const svg = cardSvg(data);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = 1000; c.height = 1400;
      const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0, 1000, 1400);
      c.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `gripp-card-${data.handle}.png`; a.click(); update((x) => ({ ...x, shared: x.shared + 1 })); setMsg("Card saved. Show and tell quest progress updated."); });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
  const link = typeof window !== "undefined" ? `${location.origin}/api/card/png?h=${data.handle}&hp=${hp}&sq=${data.squad}&no=${data.serial}&p=${data.stats.Precision}&s=${data.stats.Speed}&b=${data.stats.Brain}&c=${data.stats.Community}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(link); update((x) => ({ ...x, shared: x.shared + 1 })); setMsg("Share link copied."); } catch { setMsg(link); } };
  const togglePin = (id: string) => update((x) => { const p = x.profile!; const cur = p.pinned.length ? p.pinned : x.badges.slice(0, 3); const next = cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id].slice(-3); return { ...x, profile: { ...p, pinned: next } }; });
  const pinned = s.profile?.pinned.length ? s.profile.pinned : s.badges.slice(0, 3);
  return (
    <div className="wrap"><section className="block">
      <h1>Operator card</h1>
      <div className="grid g2" style={{ alignItems: "start" }}>
        <div><CardView data={data} width={360} />
          <div className="row" style={{ marginTop: 16 }}><button className="btn" onClick={download}>Save as image</button><button className="btn alt" onClick={copy}>Copy share link</button></div>
          <p className="note" role="status">{msg}</p>
        </div>
        <div className="grid">
          <div className="panel"><div className="label">Tier ladder</div>
            {TIERS.map((t) => <div key={t.n} className="row sp" style={{ padding: "6px 0", borderBottom: "1px solid var(--cream)", opacity: tierFor(hp).n >= t.n ? 1 : 0.7 }}><span>{t.roman} · {t.name}</span><span className="mono">{t.from === Infinity ? "Invite only" : `${t.from.toLocaleString()} HP`}</span></div>)}
            <p className="note">Tiers are earned by lifetime Hub Points and never lost. Engineer and above flip to the dark card.</p></div>
          <div className="panel"><div className="label">Badges · pin up to three</div>
            <div className="row" style={{ marginTop: 8 }}>{BADGES.map((b) => { const has = s.badges.includes(b.id); return <button key={b.id} className={"chip" + (pinned.includes(b.id) ? " on" : "")} disabled={!has} onClick={() => togglePin(b.id)} title={b.desc}>{b.name}</button>; })}</div>
            <p className="note">Streak {streakOf(s)} days · {s.runs.filter((r) => r.ranked).length} ranked runs · {QUESTS.length} quests available.</p></div>
        </div>
      </div>
    </section></div>
  );
}
