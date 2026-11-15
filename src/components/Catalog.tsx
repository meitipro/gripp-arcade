"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, GAMES, GameMeta } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { GameIcon } from "./GameIcon";

const CHIPS = ["All", ...CATEGORIES, "Daily only"] as const;
const match = (g: GameMeta, c: string) => c === "All" || (c === "Daily only" ? g.daily : g.category === c);
const tagsOf = (g: GameMeta) => [g.daily ? "daily" : "", g.mode === "Community" ? "live" : "", g.id === "prism-pop" ? "featured" : "", g.id === "claw-club" ? "new" : ""].filter(Boolean);

/** The library as a tile grid, filters with counts and a search field, as in the design canvas. */
export function Catalog({ limit, withSearch }: { limit?: number; withSearch?: boolean }) {
  const s = useStore();
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const list = GAMES.filter((g) => match(g, cat) && (!q || (g.name + g.tagline + g.category).toLowerCase().includes(q.toLowerCase()))).slice(0, limit ?? 99);
  return (
    <>
      {!limit && (
        <>
          {withSearch !== false && (
            <div className="searchrow">
              <label htmlFor="q" className="label muted">Search games</label>
              <div className="searchbox">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15 15l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <input id="q" type="text" placeholder="Try prism, word, squad" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
          )}
          <div className="chiprow2" role="group" aria-label="Filter by mood">
            {CHIPS.map((c) => (
              <button key={c} type="button" className={"chip" + (cat === c ? " on" : "")} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}<span style={{ opacity: .55, marginInlineStart: 8 }}>{GAMES.filter((g) => match(g, c)).length}</span></button>
            ))}
            <span style={{ marginInlineStart: "auto", alignSelf: "center", fontSize: 13, color: "var(--brown)" }}>Daily games reset at 00:00 UTC</span>
          </div>
        </>
      )}
      <div className="tiles">
        {list.map((g) => {
          const best = s.bests[g.id];
          return (
            <Link key={g.id} href={`/games/${g.id}`} className="tilecard">
              <div className="between"><span className="label bronze">No. {String(g.n).padStart(2, "0")}</span><span style={{ display: "flex", gap: 6 }}>{tagsOf(g).map((t) => <span key={t} className="label" style={{ fontSize: 11, padding: "4px 8px", borderRadius: 999, ...(t === "live" ? { background: "var(--bronze)", color: "#F4F1EC" } : t === "featured" ? { background: "var(--ink)", color: "var(--paper)" } : { border: "1px solid var(--line)" }) }}>{t}</span>)}</span></div>
              <div className="ticon"><GameIcon id={g.id} size={84} /></div>
              <div className="name">{g.name}</div>
              <p className="tag">{g.tagline}</p>
              <div className="foot"><span className="label muted" style={{ fontSize: 11 }}>{g.category} · {g.mode} · {g.minutes} min · {g.host}{best !== undefined ? ` · Best ${best.toLocaleString()}` : ""}</span><span className="label gopill">Play</span></div>
            </Link>
          );
        })}
      </div>
      {!list.length && <p className="serif" style={{ font: "200 28px var(--serif)", padding: "48px 0" }}>Nothing here yet. Gripp is still sorting this shelf.</p>}
    </>
  );
}
