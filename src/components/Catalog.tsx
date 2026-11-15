"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, GAMES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { GameIcon } from "./GameIcon";

/** The library as a tile grid: icon, name, one line, and a Play pill. */
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
      <div className="tiles">
        {list.map((g) => {
          const best = s.bests[g.id];
          return (
            <Link key={g.id} href={`/games/${g.id}`} className="tilecard">
              <div className="between"><span className="label bronze">No. {String(g.n).padStart(2, "0")}</span>{g.daily && <span className="label muted" style={{ fontSize: 11 }}>Daily</span>}</div>
              <div className="ticon"><GameIcon id={g.id} size={84} /></div>
              <div className="name">{g.name}</div>
              <p className="tag">{g.tagline}</p>
              <div className="foot"><span className="label muted" style={{ fontSize: 11 }}>{g.category} · {g.mode} · {g.minutes} min{best !== undefined ? ` · Best ${best.toLocaleString()}` : ""}</span><span className="label gopill">Play</span></div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
