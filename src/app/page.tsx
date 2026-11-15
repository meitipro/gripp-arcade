import Link from "next/link";
import { Catalog } from "@/components/Catalog";
import { Home } from "@/components/HomeClient";
import { Character, CAST } from "@/components/Cast";
import { HeroDial } from "@/components/HeroDial";
import { T } from "@/components/T";

export default function Page() {
  return (
    <div className="wrap">
      <section className="hero">
        <div className="heroGrid">
          <div>
            <h1><T k="hero1" /></h1>
            <p className="lead"><T k="hero2" /></p>
            <div className="row">
              <Link className="btn bronze" href="/daily"><T k="playDaily" /></Link>
              <Link className="btn alt" href="/games"><T k="allGames" /></Link>
            </div>
          </div>
          <div className="dialwrap"><HeroDial /></div>
        </div>
      </section>
      <Home />
      <section className="block">
        <div className="row sp"><h2>The library</h2><Link href="/games" className="more">All 20 games</Link></div>
        <Catalog limit={6} />
      </section>
      <section className="block cast">
        <h2>Five hosts, one rule: be useful</h2>
        <div className="castrow">{CAST.map((c) => <div key={c.name} className="castitem"><Character name={c.name} size={84} /><b>{c.name}</b><span>{c.role}</span></div>)}</div>
      </section>
      <section className="block prose3">
        <div><h3>Points stay honest</h3><p>Hub Points are the hub&apos;s own game score. They are capped every day, never traded, and never presented as anything official.</p></div>
        <div><h3>Runs are checked</h3><p>Every ranked run starts from a server seed and a signed, single-use id. Impossible scores are held quietly for review and never accused in public.</p></div>
        <div><h3>Streaks are gentle</h3><p>A free pause every week and no red numbers. The hub rewards a steady habit, not a long night.</p></div>
      </section>
    </div>
  );
}
