import type { Metadata } from "next";
import { CAPS, TIERS } from "@/lib/points";
import { GAMES } from "@/lib/catalog";
export const metadata: Metadata = { title: "Rules" };

export default function Page() {
  return (
    <div className="wrap"><section className="block">
      <h1>Rules and open numbers</h1>
      <p className="muted" style={{ maxWidth: "62ch" }}>Nothing is hidden. All point values and caps live here, so surprises never make anyone suspicious.</p>
      <div className="panel" style={{ maxWidth: "72ch" }}><h2>Hub Points are not Prisma Points</h2>
        <p>Hub Points (HP) are this hub&apos;s own community game score. They are capped daily, never transferred or traded, and carry no value beyond status and cosmetics. The hub never reads, writes or promises anything about official PrismaX points. This is a community-built project, not an official PrismaX product.</p></div>
      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="panel"><h2>Where HP come from</h2>
          <table className="t"><tbody>
            <tr><td>Ranked run</td><td>10 to 60 by score band · up to {CAPS.rankedRunsPerDay} a day</td></tr>
            <tr><td>Personal best</td><td>+{CAPS.pbBonus} for a real improvement of 3% or more</td></tr>
            <tr><td>Daily Five</td><td>+10 / +30 / +100 for 1 / 3 / 5 games</td></tr>
            <tr><td>Variety bonus</td><td>+{CAPS.varietyBonus} for 5 different games in a day</td></tr>
            <tr><td>Quests</td><td>20 to 300 HP, once per cycle</td></tr>
            <tr><td>Soft cap</td><td>After {CAPS.softCap} HP in a day, points arrive at half rate</td></tr>
            <tr><td>Failed runs</td><td>Earn nothing, cost nothing</td></tr>
          </tbody></table></div>
        <div className="panel"><h2>Tiers and levels</h2>
          <table className="t"><tbody>{TIERS.map((t) => <tr key={t.n}><td>{t.roman} {t.name}</td><td>{t.from === Infinity ? "Invite only" : `${t.from.toLocaleString()} HP`}</td></tr>)}</tbody></table>
          <p className="note">XP needed for level L = 60 x L^1.55, rounded down. Levels are derived from XP, never stored.</p></div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}><h2>Streaks</h2><p>A day with three or more ranked runs counts. One automatic pause per week, a season break never kills a streak. No red numbers, no loss warnings.</p></div>
      <div className="panel" style={{ marginTop: 16 }}><h2>Fair play and verification</h2>
        <p>Each ranked run gets a signed, single-use run id and a server seed. Scores outside human ranges are held quietly for staff review and paid in full if cleared. The public never sees an accusation. Squad scores count the top 20% of members.</p>
        <table className="t"><thead><tr><th>Game</th><th>Verification</th><th>Score formula</th></tr></thead><tbody>{GAMES.map((g) => <tr key={g.id}><td>{g.name}</td><td>{g.verify}</td><td>{g.formula}</td></tr>)}</tbody></table></div>
      <div className="panel" style={{ marginTop: 16 }}><h2>Code of conduct and privacy</h2>
        <p>Be kind. No hateful pixel patterns or captions, no harassment. Robot faces are the default and photos are opt in only. This build stores your data on your device only. Use Settings to delete everything in one click.</p></div>
    </section></div>
  );
}
