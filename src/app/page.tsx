import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { Home } from "@/components/HomeClient";
import { Character, CAST } from "@/components/Cast";
import { T } from "@/components/T";

export default function Page() {
  return (
    <div className="wrap">
      <section className="hero contours">
        <div className="heroGrid">
          <div>
            <div className="label">Season 0 · Calibration · a community proposal</div>
            <h1><T k="hero1" /></h1>
            <p className="lead"><T k="hero2" /></p>
            <div className="row">
              <Link className="btn bronze" href="/daily"><T k="playDaily" /></Link>
              <Link className="btn alt" href="/games"><T k="allGames" /></Link>
            </div>
          </div>
          <div style={{ display: "grid", placeItems: "center" }} className="floaty" aria-hidden="true"><Character name="Gripp" size={220} /></div>
        </div>
      </section>
      <Home />
      <section className="block">
        <div className="grid g3">
          <div className="panel"><div className="label">01</div><h3>Pick a game</h3><p className="muted">Two minutes, one hand, any phone. Every game teaches a tiny piece of how robots work.</p></div>
          <div className="panel"><div className="label">02</div><h3>Earn your card</h3><p className="muted">Your robot portrait, tier, four stats and badges. Screenshot it, share it, grow it.</p></div>
          <div className="panel"><div className="label">03</div><h3>Join the squad</h3><p className="muted">Twelve regional squads, a weekly war, quests and a boss every season.</p></div>
        </div>
      </section>
      <section className="block">
        <div className="row sp"><h2>Games</h2><Link href="/games" className="label">See all 20 →</Link></div>
        <Catalog limit={6} />
      </section>
      <section className="block">
        <div className="row sp"><h2>Meet the cast</h2><Link href="/season" className="label">Season 0 →</Link></div>
        <div className="row" style={{ justifyContent: "space-between" }}>{CAST.map((c) => <div key={c.name} style={{ textAlign: "center" }}><Character name={c.name} size={72} /><div className="mono">{c.name}</div></div>)}</div>
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
