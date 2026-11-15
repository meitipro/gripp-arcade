import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { gameById, GAMES } from "@/lib/catalog";
import { GameShell } from "@/components/GameShell";
import { GameBoardCard } from "@/components/GameBoardCard";

export function generateStaticParams() { return GAMES.map((g) => ({ id: g.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = gameById((await params).id); return { title: g?.name ?? "Game", description: g?.tagline };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const g = gameById((await params).id);
  if (!g) notFound();
  const lo = [0, ...g.thresholds];
  return (
    <div className="wrap" style={{ paddingTop: 48, paddingBottom: 96 }}>
      <GameShell game={g} />
      <section style={{ marginTop: 56, display: "flex", flexWrap: "wrap", gap: 48 }}>
        <div style={{ flex: "1 1 420px" }}>
          <h2 className="disp2" style={{ margin: "0 0 16px", fontSize: 44 }}>Hub points by <i>result</i></h2>
          <table className="t" style={{ fontSize: 15 }}>
            <thead><tr><th>Result</th><th style={{ textAlign: "end" }}>HP</th></tr></thead>
            <tbody>
              {lo.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{v.toLocaleString()}{lo[i + 1] !== undefined ? ` to ${(lo[i + 1] - 1).toLocaleString()}` : " and above"}</td>
                  <td style={{ textAlign: "end", font: "200 24px var(--serif)" }}>{g.hp[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Verification: {g.verify.toLowerCase()}. Hub Points are a community game score, not an official PrismaX reward.</p>
        </div>
        <div style={{ flex: "1 1 420px" }}><GameBoardCard game={g} /></div>
      </section>
    </div>
  );
}
