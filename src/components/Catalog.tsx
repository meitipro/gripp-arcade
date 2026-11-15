"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, GAMES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { GameIcon } from "./GameIcon";

/** The library as an index, not a wall of identical cards: one row per game, scanned like a table of instruments. */
export function Catalog({ limit }: { limit?: number }) {
  const s = useStore();
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const list = GAMES.filter((g) => (cat === "All" || g.category === cat) && (!q || (g.name + g.tagline).toLowerCase().includes(q.toLowerCase()))).slice(0, limit ?? 99);
  return (
    <>
      {!limit && (
        <div className="row" style={{ margin: "20px 0 8px" }} role="group" aria-label="Filter games">
          <input type="text" placeholder="Search games" aria-label="Search games" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 180 }} />
          {["All", ...CATEGORIES].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)} aria-pressed={cat === c}>{c}</button>)}
        </div>
      )}
      {!list.length && <p className="muted">No game matches that.</p>}
      <ul className="index">
        {list.map((g) => {
          const best = s.bests[g.id];
          return (
            <li key={g.id}>
              <Link href={`/games/${g.id}`} className="idxrow">
                <GameIcon id={g.id} size={56} />
                <span className="idxmain"><b className="idxname">{g.name}</b><span className="idxtag">{g.tagline}</span></span>
                <span className="idxmeta"><span>{g.category} · {g.minutes} min</span><span className="num">{best !== undefined ? `Best ${best.toLocaleString()}` : g.host}</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
