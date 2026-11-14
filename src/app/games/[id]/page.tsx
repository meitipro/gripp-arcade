import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { gameById, GAMES } from "@/lib/catalog";
import { GameShell } from "@/components/GameShell";

export function generateStaticParams() { return GAMES.map((g) => ({ id: g.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = gameById((await params).id); return { title: g?.name ?? "Game", description: g?.tagline };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const g = gameById((await params).id);
  if (!g) notFound();
  const lo = [0, ...g.thresholds];
  return (
    <div className="wrap" style={{ paddingTop: 24 }}>
      <GameShell game={g} />
      <section className="block">
        <div className="grid g2">
          <div className="panel"><h3>How it works</h3><ol style={{ paddingInlineStart: 20, margin: 0 }}>{g.rules.map((r) => <li key={r}>{r}</li>)}</ol><p className="note">{g.formula}</p></div>
          <div className="panel"><h3>Hub Points by result</h3>
            <table className="t"><thead><tr><th>Result</th><th>HP</th></tr></thead><tbody>
              {lo.map((v, i) => <tr key={i}><td>{v.toLocaleString()}{lo[i + 1] !== undefined ? ` to ${(lo[i + 1] - 1).toLocaleString()}` : " and above"}</td><td>{g.hp[i]}</td></tr>)}
            </tbody></table>
            <p className="note">Verification: {g.verify}. Hub Points are a community game score, not an official PrismaX reward.</p></div>
        </div>
      </section>
    </div>
  );
}
