"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, GAMES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { GameIcon } from "./GameIcon";

export function Catalog({ limit }: { limit?: number }) {
  const s = useStore();
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const list = GAMES.filter((g) => (cat === "All" || g.category === cat) && (!q || (g.name + g.tagline).toLowerCase().includes(q.toLowerCase()))).slice(0, limit ?? 99);
  return (
    <>
      {!limit && <div className="row" style={{ margin: "16px 0" }} role="group" aria-label="Filter by category">
        <input type="text" placeholder="Search games" aria-label="Search games" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 160 }} />
        {["All", ...CATEGORIES].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>}
      {!list.length && <p className="muted">No game matches that.</p>}
      <div className="grid g3">
        {list.map((g) => (
          <Link key={g.id} href={`/games/${g.id}`} className="gamecard">
            <div className="row sp"><GameIcon id={g.id} size={52} /><span className="num">{String(g.n).padStart(2, "0")} · {g.category.toUpperCase()}</span></div>
            <h3 style={{ margin: 0 }}>{g.name}</h3>
            <span className="muted" style={{ fontSize: ".9rem" }}>{g.tagline}</span>
            <span className="mono" style={{ marginTop: "auto" }}>{g.minutes} min · {g.host}{s.bests[g.id] !== undefined ? ` · best ${s.bests[g.id].toLocaleString()}` : ""}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
