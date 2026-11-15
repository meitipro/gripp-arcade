import Link from "next/link";
import { Character, CAST } from "@/components/Cast";
import { HeroGripp } from "@/components/HeroGripp";
import { Arena, BossPanel, CardTeaser, Loops, OneRule, Ticker, WallTeaser } from "@/components/Landing";
import { T, TI } from "@/components/T";
import { contourPath } from "@/lib/motifs";

export default function Page() {
  const hero = contourPath(1180, 360, 16, 40, 34, 2.1);
  return (
    <>
      <section className="v3hero">
        <svg className="drift" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d={hero} fill="none" stroke="#7A6B5A" strokeOpacity=".13" /></svg>
        <div className="v3herogrid">
          <div className="v3herotext">
            <div className="chiprow"><span className="label pillbd"><T k="heroKicker" /></span><span className="label muted"><i className="pulse livedot" />Season 0 · Calibration · Live</span></div>
            <h1 className="mega"><TI k="heroTitle" /></h1>
            <div className="herosub">
              <p className="lead"><T k="hero2" /></p>
              <div className="row"><Link className="btn" href="/daily"><T k="playDaily" /></Link><Link className="btn alt" href="/games"><T k="allGames" /></Link></div>
            </div>
            <div className="statstrip"><div><b className="disp2">20</b><span className="label muted">Games</span></div><div><b className="disp2">12</b><span className="label muted">Squads</span></div><div><b className="disp2"><i>0</i></b><span className="label muted">Wallets needed</span></div></div>
          </div>
          <HeroGripp />
        </div>
      </section>
      <Ticker />
      <Loops />
      <Arena />
      <BossPanel />
      <CardTeaser />
      <WallTeaser />
      <section className="v3sec cast">
        <h2 className="disp3">Five hosts, one rule: be useful</h2>
        <div className="castrow">{CAST.map((c) => <div key={c.name} className="castitem"><Character name={c.name} size={84} /><b>{c.name}</b><span>{c.role}</span></div>)}</div>
      </section>
      <OneRule />
    </>
  );
}
