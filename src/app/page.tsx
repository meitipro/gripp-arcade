import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { Home } from "@/components/HomeClient";

export default function Page() {
  return (
    <div className="wrap">
      <section className="hero">
        <div className="label">A community proposal · November 2026</div>
        <h1>The game hub for PrismaX.</h1>
        <p className="lead">Twenty small games, one operator card, a cast of small robots and a community wall. Quick sessions, honest rules, no wallet, no money.</p>
        <div className="row">
          <Link className="btn bronze" href="/daily">Play today&apos;s Daily Five</Link>
          <Link className="btn alt" href="/games">Browse all 20 games</Link>
        </div>
      </section>
      <Home />
      <section className="block">
        <div className="row sp"><h2>Games</h2><Link href="/games" className="label">See all 20 →</Link></div>
        <Catalog limit={6} />
      </section>
      <section className="block">
        <div className="grid g3">
          <div className="panel"><h3>Honest points</h3><p className="muted">Hub Points are the hub&apos;s own game score. Capped daily, never traded, never mixed up with anything official.</p></div>
          <div className="panel"><h3>Verified runs</h3><p className="muted">Every ranked run gets a server seed and a signed run id. Impossible scores are held quietly for review, never publicly accused.</p></div>
          <div className="panel"><h3>Gentle streaks</h3><p className="muted">A free pause every week. No red numbers, no shame notifications. Habit, not pressure.</p></div>
        </div>
      </section>
    </div>
  );
}
