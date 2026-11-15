"use client";
import { useMemo } from "react";
import { GameMeta } from "@/lib/catalog";
import { sampleMembers } from "@/lib/members";
import { hashString, mulberry32 } from "@/lib/rng";
import { useStore } from "@/lib/store";

/** Today's board for one game: sample members plus your own best. Same look as the canvas game page. */
export function GameBoardCard({ game }: { game: GameMeta }) {
  const s = useStore();
  const me = s.profile?.handle ?? "you";
  const rows = useMemo(() => {
    const a = sampleMembers().map((m) => ({ handle: m.handle, score: Math.round(game.par * (0.15 + mulberry32(hashString(m.handle + game.id))() * 0.95)) }));
    const b = s.bests[game.id];
    if (b !== undefined) a.push({ handle: me, score: b });
    return a.sort((x, y) => y.score - x.score);
  }, [game, s.bests, me]);
  const top = rows.slice(0, 5);
  const myIx = rows.findIndex((r) => r.handle === me);
  const shown = myIx >= 5 ? [...top.slice(0, 4), rows[myIx]] : top;
  return (
    <div>
      <h2 className="disp2" style={{ margin: "0 0 16px", fontSize: 44 }}>Today&apos;s <i>board</i></h2>
      <div style={{ borderTop: "1px solid var(--ink)" }}>
        {shown.map((r) => {
          const ix = rows.indexOf(r);
          return (
            <div key={r.handle} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "12px 8px", borderBottom: "1px solid var(--line)", background: r.handle === me ? "color-mix(in srgb, var(--cream) 70%, transparent)" : undefined }}>
              <span className="label bronze" style={{ width: 28 }}>{String(ix + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 13 }}>@{r.handle}</span>
              <span style={{ font: "200 26px var(--serif)" }}>{r.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
      <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>Sample members fill the board until the community arrives.</p>
    </div>
  );
}
