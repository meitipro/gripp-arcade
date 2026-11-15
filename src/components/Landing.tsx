import Link from "next/link";
import { GAMES } from "@/lib/catalog";
import { SAMPLE_HANDLES, robotFace } from "@/lib/members";
import { contourPath, floorPath } from "@/lib/motifs";
import { BOSS } from "@/lib/season";

const LOOPS = [
  { n: "01", meta: "Under 3 min", t: "Play", b: "Short, honest games with a daily rhythm. No wallet, no signature, nothing to install." },
  { n: "02", meta: "6 tiers", t: "Collect", b: "Every run feeds one operator card: stats, badges, season stamps and a tier." },
  { n: "03", meta: "12 squads", t: "Belong", b: "Squads, a wall of faces, and a weekly boss the whole community fights together." },
  { n: "04", meta: "Voted weekly", t: "Contribute", b: "Captions, levels, fan art and question packs made by members, voted by members." },
];
const TICKER = ["two new squads joined today", "glitch prime is down to 58 percent", "servo word no. 118 is live", "pixelpari set a new best in prism pop, 9,450", "squad iran leads the region war", "the daily five resets at 00:00 utc", "caption bench voting closes sunday"];
const TIERS = ["Cadet", "Operator", "Specialist", "Engineer", "Architect", "Genesis"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export function Face({ handle, size = 64 }: { handle: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ borderRadius: size * 0.22, background: "var(--cream)", flex: "none" }} dangerouslySetInnerHTML={{ __html: robotFace(handle) }} />;
}

export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="ticker" aria-label="News from Dot"><div className="tickrun">{items.map((t, i) => <span key={i}><b>DOT</b>{t}<i /></span>)}</div></div>
  );
}

export function Loops() {
  return (
    <section id="loops" className="v3sec">
      <div className="v3head"><h2 className="disp">Four loops, one <i>small</i> arcade</h2><p>Every run feeds a card, every card sits on a wall, and the wall fights a boss together on Sundays.</p></div>
      <div className="loops">{LOOPS.map((l) => (
        <div key={l.n} className="loop"><div className="between"><span className="label bronze">{l.n}</span><span className="label muted">{l.meta}</span></div><h3 className="disp3">{l.t}</h3><p>{l.b}</p></div>
      ))}</div>
    </section>
  );
}

export function Arena() {
  const floor = floorPath(1440, 430, 16, 14);
  return (
    <section className="arena">
      <svg className="arenafloor" viewBox="0 0 1440 430" preserveAspectRatio="none" aria-hidden="true"><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".22" /></svg>
      <div className="arenain">
        <div className="between wrapflex">
          <div><div className="label gold">The library · 20 games · Solo, duel, co-op, community</div><h2 className="disp onink">Small games,<br /><i>drawn</i> like diagrams</h2></div>
          <Link href="/games" className="btn paperbtn">Open the library</Link>
        </div>
        <div className="featgrid">
          <Link href="/games/pick-place" className="feat">
            <div className="label featbar"><span>Time 00:42</span><span>Combo ×4</span><span>1,240</span></div>
            <svg viewBox="0 0 400 240" role="img" aria-label="Pick and Place: a gripper drops a triangle from a belt into its bin">
              <path d="M20 30H380" stroke="#F4F1EC" strokeOpacity=".2" strokeWidth="6" strokeLinecap="round" />
              <rect x="196" y="30" width="18" height="40" fill="#F4F1EC" /><path d="M196 70L186 96M214 70L224 96" stroke="#F4F1EC" strokeWidth="3" strokeLinecap="round" />
              <path d="M205 104L193 124H217Z" fill="none" stroke="#B9986A" strokeWidth="2.5" /><path d="M205 128V170" stroke="#B9986A" strokeDasharray="3 5" />
              <rect x="20" y="138" width="360" height="22" rx="11" fill="none" stroke="#F4F1EC" strokeOpacity=".5" />
              <rect x="60" y="118" width="18" height="18" fill="none" stroke="#F4F1EC" strokeWidth="2" /><circle cx="120" cy="127" r="9" fill="none" stroke="#F4F1EC" strokeWidth="2" /><rect x="290" y="118" width="18" height="18" fill="none" stroke="#F4F1EC" strokeWidth="2" />
              <path d="M60 186h70v40H60zM165 186h70v40h-70zM270 186h70v40h-70z" fill="none" stroke="#F4F1EC" strokeOpacity=".55" /><path d="M305 198l-8 14h16z" fill="none" stroke="#B9986A" strokeWidth="2" />
            </svg>
            <div className="featfoot"><div><div className="disp3 onink">Pick &amp; Place</div><div className="label dim">Skill · 3 min · Host Gripp</div></div><span className="label gold">01</span></div>
          </Link>
          <Link href="/games/prism-bender" className="feat">
            <div className="label featbar"><span>Board 2 / 3</span><span>Moves 6 / 9</span><span>Par 7</span></div>
            <svg viewBox="0 0 400 240" role="img" aria-label="Prism Bender: one beam enters a prism and leaves as three rays that light three sensors">
              <path d="M20 120L170 120" stroke="#F4F1EC" strokeWidth="2.5" /><path d="M170 96L196 142H144Z" fill="#202020" stroke="#F4F1EC" strokeWidth="2" />
              <path d="M184 116L330 60" stroke="#F4F1EC" strokeWidth="2" /><path d="M188 122L330 120" stroke="#B56654" strokeWidth="2" /><path d="M184 128L268 176H330" stroke="#B9986A" strokeWidth="2" fill="none" />
              <circle cx="342" cy="60" r="11" fill="#F4F1EC" /><circle cx="342" cy="120" r="11" fill="none" stroke="#B56654" strokeWidth="2.5" /><circle cx="342" cy="120" r="5" fill="#B56654" /><circle cx="342" cy="176" r="11" fill="none" stroke="#B9986A" strokeWidth="2.5" />
            </svg>
            <div className="featfoot"><div><div className="disp3 onink">Prism Bender</div><div className="label dim">Puzzle · 2 min · Host Lumen</div></div><span className="label gold">04</span></div>
          </Link>
          <Link href="/games/servo" className="feat">
            <div className="label featbar"><span>Daily word</span><span>2 / 6</span><span>Daily</span></div>
            <div className="servogrid">
              {["R", "O", "B", "O", "T"].map((c, i) => <span key={i} className={"sc" + (i === 0 ? " y" : "")}>{c}</span>)}
              {["G", "R", "I", "P", "S"].map((c, i) => <span key={i} className="sc g">{c}</span>)}
              <div className="label dim legend">■ right · ◇ moved · · absent</div>
            </div>
            <div className="featfoot"><div><div className="disp3 onink">Servo</div><div className="label dim">Puzzle · 4 min · Host Moss</div></div><span className="label gold">05</span></div>
          </Link>
        </div>
        <ol className="gamelist">{GAMES.map((g) => <li key={g.id}><Link href={`/games/${g.id}`}><span className="label gold">{String(g.n).padStart(2, "0")}</span><span className="disp4">{g.name}</span><span className="label dim">{g.category} · {g.minutes}m</span></Link></li>)}</ol>
      </div>
    </section>
  );
}

export function BossPanel() {
  const floor = floorPath(400, 160, 8, 8);
  return (
    <section className="v3sec bossrow" id="season">
      <div className="bossleft">
        <div className="label bronze">Every day at 00:00 UTC</div>
        <h2 className="disp">The Daily <i>Five</i></h2>
        <p>Five seeded games, one per category. Same seed for everyone, so the board is fair and the talk in Discord is about the same puzzle.</p>
        <Link href="/daily" className="btn">Play today&apos;s five</Link>
      </div>
      <div className="bosscard">
        <svg className="bossfloor" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true"><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".2" /></svg>
        <div className="label between gold"><span>Community boss</span><span>Sundays</span></div>
        <svg className="glitchface" width="180" height="150" viewBox="0 0 180 150" role="img" aria-label="Glitch Prime, a robot face made of dropped frames">
          <rect x="20" y="20" width="140" height="100" rx="26" fill="none" stroke="#F4F1EC" strokeWidth="3" strokeDasharray="18 6 4 6" /><rect x="52" y="52" width="22" height="30" rx="4" fill="#F4F1EC" /><rect x="106" y="56" width="22" height="22" fill="#B56654" />
          <path d="M8 66H40M140 86H176M60 100H120" stroke="#F4F1EC" strokeOpacity=".6" strokeWidth="2" />
        </svg>
        <h3 className="disp3 onink center">Glitch <i>Prime</i></h3>
        <p className="center dim" style={{ margin: "6px 0 18px" }}>&quot;p...ick. m...e.&quot;</p>
        <div className="bossbar2"><i style={{ width: "58%" }} /></div>
        <div className="label between dim" style={{ marginTop: 10 }}><span>{BOSS.hp.toLocaleString()} HP</span><span>Every ranked run hits</span></div>
      </div>
    </section>
  );
}

export function CardTeaser() {
  const c = contourPath(250, 380, 12, 20, 22, 4.2, 1);
  return (
    <section className="cardsec">
      <div className="v3sec cardin">
        <div className="cardstage">
          <div className="cardghost" aria-hidden="true"><div className="label gold" style={{ padding: 18 }}>Tier V · Architect</div></div>
          <Link href="/card" className="opcard">
            <svg viewBox="0 0 320 460" aria-hidden="true" className="opcontour"><path d={c} fill="none" stroke="#7A6B5A" strokeOpacity=".12" /></svg>
            <div className="label opbar"><span>Gripp Arcade</span><span>No. 0813</span></div>
            <div className="ophead"><Face handle="mira.ops" size={84} /><div><div className="label bronze">Tier III</div><div className="disp2"><i>Specialist</i></div><div className="label muted">LV 23</div></div></div>
            <div className="ophandle"><b>@mira.ops</b><div className="label muted">Squad Iran · since Nov 2026</div></div>
            <div className="opstats">{[["Precision", 72], ["Speed", 64], ["Brain", 81], ["Community", 58]].map(([k, v]) => (
              <div key={k as string}><span className="label">{k}</span><span className="obar"><i style={{ width: `${v}%` }} /></span><span className="label">{v}</span></div>
            ))}</div>
            <div className="opfoot"><span className="label muted">Season 0 stamp</span><div><div className="disp2">2,480</div><div className="label muted" style={{ fontSize: 11 }}>Hub points</div></div></div>
          </Link>
        </div>
        <div className="cardtext">
          <div className="label bronze">The operator card</div>
          <h2 className="disp">One card that <i>grows</i> with you</h2>
          <p>A face, a tier, four stats and a few badges, printed in cream and ink like a lab badge. Every run fills it in. It is the thing people screenshot and pin.</p>
          <div className="tiers6">{TIERS.map((t, i) => <div key={t} className={"tier" + (i === 2 ? " cur" : i >= 3 ? " dk" : "") + (i === 5 ? " gen" : "")}><span className="label">Tier {ROMAN[i]}</span><span className="disp3">{t}</span></div>)}</div>
        </div>
      </div>
    </section>
  );
}

export function WallTeaser() {
  const hs = SAMPLE_HANDLES.slice(0, 24);
  return (
    <section className="v3sec" id="wall">
      <div className="v3head"><div><div className="label bronze">Wall of Amplifiers</div><h2 className="disp">No one is a <i>grey</i> circle</h2></div><p>Every member gets a robot face drawn from their handle. Opt in to show your Discord or X picture instead.</p></div>
      <div className="facegrid">{hs.map((h) => <Link key={h} href="/wall" className="faceitem"><Face handle={h} /><span className="mono2">{h}</span></Link>)}</div>
      <p className="label muted" style={{ marginTop: 16 }}>Sample handles. No real person shown.</p>
    </section>
  );
}

export function OneRule() {
  return (
    <section className="v3sec onerule">
      <svg width="220" height="70" viewBox="0 0 220 70" aria-hidden="true"><path d="M0 35H96" stroke="var(--ink)" strokeWidth="2" /><path d="M96 14L122 56H70Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" /><path d="M106 33L220 6" stroke="var(--ink)" strokeWidth="2" /><path d="M108 36H220" stroke="var(--bronze)" strokeWidth="2" /><path d="M106 40L220 66" stroke="var(--gold)" strokeWidth="2" /></svg>
      <div className="label bronze" style={{ margin: "26px 0 20px" }}>The one rule</div>
      <h2 className="disp ruleh">Nothing here asks for money, a wallet or a <i>signature</i></h2>
      <p className="rulep">Hub Points are community bragging rights and cosmetic unlocks. They are never tokens, rewards of value, or a promise of anything from PrismaX.</p>
      <Link href="/daily" className="btn">Start playing</Link>
    </section>
  );
}
