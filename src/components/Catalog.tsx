"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, GAMES } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function Catalog({ limit }: { limit?: number }) {
  const s = useStore();
  const [cat, setCat] = useState<string>("All");
  const list = GAMES.filter((g) => cat === "All" || g.category === cat).slice(0, limit ?? 99);
  return (
    <>
      {!limit && <div className="row" style={{ margin: "16px 0" }} role="group" aria-label="Filter by category">
        {["All", ...CATEGORIES].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>}
      <div className="grid g3">
        {list.map((g) => (
          <Link key={g.id} href={`/games/${g.id}`} className="gamecard">
            <span className="num">{String(g.n).padStart(2, "0")} · {g.category.toUpperCase()} · {g.mode.toUpperCase()}</span>
            <h3 style={{ margin: 0 }}>{g.name}</h3>
            <span className="muted" style={{ fontSize: ".9rem" }}>{g.tagline}</span>
            <span className="mono" style={{ marginTop: "auto" }}>{g.minutes} min · {g.host}{s.bests[g.id] !== undefined ? ` · best ${s.bests[g.id].toLocaleString()}` : ""}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
