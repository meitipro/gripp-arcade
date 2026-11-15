"use client";
import { useMemo, useState } from "react";
import { CardView } from "@/components/CardView";
import { cardSvg } from "@/lib/card";
import { contourPath } from "@/lib/motifs";
import { dayCounts, memberCard, streakOf, totalHp, update, useStore } from "@/lib/store";
import { BADGES } from "@/lib/catalog";
import { TIERS, tierFor } from "@/lib/points";
import { sampleMembers } from "@/lib/members";

const ICONS = [
  "M18 32l7-14 7 14M21 26h8", "M25 12c6 6 6 12 0 26-6-14-6-20 0-26z", "M25 13l11 22H14zM10 24h8", "M15 25l7 7 13-18",
  "M14 14h22v22H14zM14 25h22M25 14v22", "M18 22a4 4 0 1 0 .01 0M32 22a4 4 0 1 0 .01 0M12 36c2-6 10-6 12 0M26 36c2-6 10-6 12 0", "M25 12v8M25 30v8M12 25h8M30 25h8",
];
const PACE = ["Day one", "~ 1 week", "~ 1 month", "~ 1 season", "Top play", "Granted"];

export default function Page() {
  const s = useStore();
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<number | null>(null);
  const data = memberCard(s);
  const hp = totalHp(s);
  const actual = tierFor(hp).n;
  const shownTier = preview ?? actual;
  const bg = useMemo(() => contourPath(300, 300, 18, 16, 20, 3.3, 1), []);
  const back = useMemo(() => contourPath(150, 220, 14, 10, 16, 1.3, 1), []);
  const members = useMemo(() => sampleMembers(), []);
  const rank = 1 + members.filter((m) => m.hp > hp).length;
  const runs = s.runs.filter((r) => r.ranked).length;
  void dayCounts;

  const download = () => {
    const svg = cardSvg({ ...data, tier: shownTier });
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
  const post = () => { const t = encodeURIComponent(`My Gripp Arcade operator card: tier ${tierFor(hp).name}, ${hp.toLocaleString()} Hub Points. Community-built, unofficial.`); window.open(`https://twitter.com/intent/tweet?text=${t}&url=${encodeURIComponent(link)}`, "_blank", "noopener,noreferrer"); update((x) => ({ ...x, shared: x.shared + 1 })); };
  const togglePin = (id: string) => update((x) => { const p = x.profile!; const cur = p.pinned.length ? p.pinned : x.badges.slice(0, 3); const next = cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id].slice(-3); return { ...x, profile: { ...p, pinned: next } }; });
  const pinned = s.profile?.pinned.length ? s.profile.pinned : s.badges.slice(0, 3);
  const handle = data.handle;
  const dot = handle.indexOf(".");

  return (
    <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 64 }}>
        <div className="cardstagebig">
          <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}><path d={bg} fill="none" stroke="#7A6B5A" strokeOpacity=".14" /></svg>
          <div style={{ position: "relative", transition: "transform .48s var(--ease)" }}><CardView data={{ ...data, tier: shownTier }} width={300} /></div>
          <div style={{ position: "relative", width: 300, height: 428, borderRadius: 18, background: "#202020", color: "#F4F1EC", boxShadow: "0 40px 60px -34px rgba(74,64,56,.6)", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 300 440" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}><path d={back} fill="none" stroke="#B9986A" strokeOpacity=".3" /></svg>
            <svg width="120" height="110" viewBox="0 0 56 52" aria-hidden="true" style={{ position: "relative" }}><rect x="6" y="4" width="44" height="32" rx="11" fill="#F4F1EC" /><rect x="17" y="13" width="7" height="12" rx="3.5" fill="#202020" /><rect x="32" y="13" width="7" height="12" rx="3.5" fill="#202020" /><path d="M24 36L20 48M32 36L36 48" stroke="#F4F1EC" strokeWidth="3" strokeLinecap="round" /><circle cx="46" cy="4" r="2.6" fill="#B56654" /></svg>
            <div className="serif" style={{ position: "relative", font: "200 34px var(--serif)", marginTop: 18 }}>Gripp <i>Arcade</i></div>
            <div className="label" style={{ position: "relative", color: "#B9986A", marginTop: 8 }}>Serial GA-S0-{String(data.serial).padStart(4, "0")}</div>
          </div>
          <div className="label muted" style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", gap: 28 }}><span>Front</span><span>Back</span><span>Pick a tier below to restyle the card</span></div>
        </div>

        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <div className="label bronze" style={{ marginBottom: 16 }}>Operator card · public sample at /card/{handle}</div>
          <h1 className="serif" style={{ margin: 0, font: "200 clamp(52px, 6.4vw, 96px)/.92 var(--serif)", letterSpacing: "-.035em", wordBreak: "break-all" }}>{dot > 0 ? <>{handle.slice(0, dot)}<i>{handle.slice(dot)}</i></> : <i>{handle}</i>}</h1>
          <p style={{ margin: "18px 0 28px", maxWidth: "42ch", color: "var(--soft)" }}>{runs ? `You have played ${runs} ranked run${runs === 1 ? "" : "s"} this season.` : "Play a ranked run to start filling this card."} Hub Points are a community game score, not an official PrismaX reward.</p>
          <div className="cardstats4">
            <div><div className="serif">{data.level}</div><div className="label muted">Level</div></div>
            <div><div className="serif">{streakOf(s)}</div><div className="label muted">Streak</div></div>
            <div><div className="serif">{runs}</div><div className="label muted">Runs</div></div>
            <div><div className="serif">#{rank}</div><div className="label muted">Season</div></div>
          </div>
          <div className="row" style={{ margin: "24px 0 8px" }}>
            <button type="button" className="btn" onClick={download}>Download PNG</button>
            <button type="button" className="btn alt" onClick={copy}>Copy link</button>
            <button type="button" className="btn alt" onClick={post}>Post on X</button>
          </div>
          <p className="muted" role="status" style={{ minHeight: 22, fontSize: 13 }}>{msg}</p>
          <h2 className="serif" style={{ margin: "24px 0 14px", font: "200 34px var(--serif)" }}>Badges <span className="label muted" style={{ marginInlineStart: 8 }}>{s.badges.length} of {BADGES.length} · pin up to three</span></h2>
          <div className="badgegrid">
            {BADGES.map((b, i) => {
              const has = s.badges.includes(b.id), on = pinned.includes(b.id);
              return (
                <div key={b.id}>
                  <button type="button" disabled={!has} onClick={() => togglePin(b.id)} aria-pressed={on} aria-label={`${b.name}${has ? "" : " (locked)"}`} title={b.desc} style={{ background: "none", border: 0, padding: 0, cursor: has ? "pointer" : "default" }}>
                    <svg width="60" height="60" viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="22" fill="none" stroke={has ? "#B9986A" : "var(--line)"} strokeWidth={on ? 3.5 : 2} /><path d={ICONS[i % ICONS.length]} fill="none" stroke={has ? "var(--ink)" : "var(--line)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <span className="label" style={{ fontSize: 11, color: has ? "var(--ink)" : "var(--brown)" }}>{b.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section style={{ marginTop: 72 }}>
        <div className="between" style={{ flexWrap: "wrap", borderBottom: "1px solid var(--ink)", paddingBottom: 16, alignItems: "flex-end" }}>
          <h2 className="disp2" style={{ margin: 0, fontSize: "clamp(40px, 4.6vw, 64px)", lineHeight: 1 }}>Six <i>tiers</i></h2>
          <p style={{ margin: 0, maxWidth: "46ch", color: "var(--brown)", fontSize: 14 }}>Light cards for the first three. Ink with gold detail from Engineer up. Genesis is for founding contribution and is the only card with a gold edge. Tiers are earned by lifetime Hub Points and never lost.</p>
        </div>
        <div className="tiersel">
          {TIERS.map((t, i) => {
            const dark = i >= 3;
            return (
              <button key={t.n} type="button" className="tierbtn" aria-pressed={shownTier === t.n} onClick={() => setPreview(t.n === actual ? null : t.n)}
                style={{ background: dark ? "#202020" : "#F4F1EC", color: dark ? "#F4F1EC" : "#202020", border: `1.5px solid ${i === 5 ? "#B9986A" : dark ? "#202020" : i === 2 ? "#202020" : "rgba(32,32,32,.25)"}` }}>
                <div className="label" style={{ display: "flex", justifyContent: "space-between", opacity: .8, fontSize: 11 }}><span>Tier {t.roman}</span><span>{PACE[i]}</span></div>
                <div style={{ flex: 1 }} />
                <div className="serif" style={{ font: "italic 200 34px/1 var(--serif)" }}>{t.name}</div>
                <div className="label" style={{ marginTop: 6, opacity: .75, fontSize: 11 }}>{t.from === Infinity ? "By contribution" : `${t.from.toLocaleString()} HP`}{t.n === actual ? " · you" : ""}</div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
