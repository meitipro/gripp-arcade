"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Character } from "@/components/Cast";
import { PageHead } from "@/components/PageHead";
import { GAMES } from "@/lib/catalog";
import { sampleMembers } from "@/lib/members";
import { floorPath } from "@/lib/motifs";
import { levelFor, nextTier, tierFor } from "@/lib/points";
import { hashString, mulberry32 } from "@/lib/rng";
import { statsOf, streakOf, totalHp, update, useStore } from "@/lib/store";
import { syncToDiscord } from "@/lib/sync";

const APP_ID = process.env.NEXT_PUBLIC_DISCORD_APP_ID;
const INVITE = APP_ID ? `https://discord.com/oauth2/authorize?client_id=${APP_ID}&scope=applications.commands%20bot&permissions=0` : "";
const CMDS = [
  ["/stats [member]", "Hub Points, level, tier, squad, ranked runs, streak, games played, badges, wall tiles, boss damage and top games"],
  ["/leaderboard", "Top ten operators by Hub Points"],
  ["/daily", "Today's Daily Five"],
  ["/link", "Get a private 6 digit code to link your hub account"],
  ["/about", "What the hub is"],
];
type Found = { handle: string; hp: number; squad: string; since: string; rank: number; total: number; level: number; streak: number; stats: [string, number][]; roles: string[]; self: boolean };

export default function Page() {
  const s = useStore();
  const members = useMemo(() => sampleMembers(), []);
  const me = s.profile?.handle ?? "you";
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "missing" | "found">("idle");
  const [shown, setShown] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const linked = !!s.profile?.discordToken;
  const floor = useMemo(() => floorPath(600, 300, 14, 8), []);

  const board = useMemo(() => [...members.map((m) => ({ handle: m.handle, hp: m.hp })), { handle: me, hp: totalHp(s) }].sort((a, b) => b.hp - a.hp), [members, me, s]);

  const lookup = (raw: string) => {
    const h = raw.trim().replace(/^@/, "").toLowerCase();
    if (!h) return;
    setShown(h); setState("loading"); setFound(null);
    setTimeout(() => {
      const ix = board.findIndex((b) => b.handle.toLowerCase() === h);
      if (ix < 0) return setState("missing");
      const b = board[ix];
      const self = b.handle === me;
      const sm = members.find((m) => m.handle === b.handle);
      const r = mulberry32(hashString(b.handle + "stats"));
      const st: [string, number][] = self ? Object.entries(statsOf(s)) as [string, number][] : ["Precision", "Speed", "Brain", "Community"].map((k) => [k, 30 + Math.floor(r() * 60)]);
      const t = tierFor(b.hp);
      setFound({ handle: b.handle, hp: b.hp, squad: self ? (s.profile?.squad ?? "GL") : (sm?.squad ?? "GL"), since: "Nov 2026", rank: ix + 1, total: board.length, level: self ? levelFor(b.hp) : levelFor(Math.floor(b.hp * 1.1)), streak: self ? streakOf(s) : (sm?.streak ?? 0), stats: st, roles: [`Tier ${t.roman} ${t.name}`, `Squad ${self ? s.profile?.squad : sm?.squad}`, "Amplifier"], self });
      setState("found");
    }, 520);
  };

  const near = found ? board.slice(Math.max(0, found.rank - 3), Math.max(0, found.rank - 3) + 5).map((b, i) => ({ ...b, rank: Math.max(0, found.rank - 3) + i + 1 })) : [];
  const spark = useMemo(() => {
    if (!found) return null;
    const r = mulberry32(hashString(found.handle + "rank"));
    const pts: number[] = []; let v = found.rank + 14 + Math.floor(r() * 20);
    for (let i = 0; i < 12; i++) { pts.push(v); v = Math.max(found.rank, v - Math.floor(r() * 6) - (i < 10 ? 1 : 0)); } pts[11] = found.rank;
    const hi = Math.max(...pts), lo = Math.min(...pts), span = Math.max(1, hi - lo);
    const xy = pts.map((p, i) => [i * (300 / 11), 10 + ((p - lo) / span) * 62] as const);
    const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
    return { line, fill: `${line}L300 90L0 90Z`, x: xy[11][0], y: xy[11][1], from: pts[0], delta: pts[0] - pts[11] };
  }, [found]);

  const link = async () => {
    setMsg("Linking…");
    try {
      const r = await fetch("/api/discord/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const j = await r.json();
      if (!r.ok) return setMsg(j.error || "Could not link");
      update((x) => ({ ...x, profile: x.profile && { ...x.profile, discordToken: j.token } }));
      setCode(""); setMsg("Linked! Your stats will now appear in Discord."); setTimeout(syncToDiscord, 200);
    } catch { setMsg("Network error"); }
  };

  const tier = found ? tierFor(found.hp) : null, nt = found ? nextTier(found.hp) : null;
  const pct = found && nt ? Math.min(100, ((found.hp - tier!.from) / (nt.from - tier!.from)) * 100) : 100;

  return (
    <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
      <PageHead kicker="Discord · Rank lookup" title="Find your rank" aside={<p style={{ margin: 0, maxWidth: "40ch", color: "var(--soft)" }}>Type any hub handle and see where that operator stands: rank, tier, streak, roles. No sign in needed to look. Link your own below.</p>} />

      <form onSubmit={(e) => { e.preventDefault(); lookup(q); }} style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 520px", minWidth: 0 }}>
          <label htmlFor="u" className="label muted" style={{ display: "block", marginBottom: 8 }}>Hub handle</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "2px solid var(--ink)", padding: "4px 0" }}>
            <span className="serif" style={{ font: "200 52px/1 var(--serif)", color: "var(--bronze)" }}>@</span>
            <input id="u" type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="mira.ops" autoComplete="off" spellCheck={false} className="bigfield" />
          </div>
        </div>
        <button type="submit" className="btn" style={{ minHeight: 64, padding: "0 36px" }}>Look up rank</button>
      </form>
      <div className="row" style={{ marginTop: 16, gap: 8 }}>
        <span className="label muted" style={{ marginInlineEnd: 6 }}>Try</span>
        {["mira.ops", "kian_grip", "servo_sara", "pixelpari", me].map((h, i) => <button key={h + i} type="button" className="chip" style={{ textTransform: "none", letterSpacing: ".1em" }} onClick={() => { setQ(h); lookup(h); }}>{i === 4 ? `${h} (you)` : h}</button>)}
        <span style={{ fontSize: 12.5, color: "var(--brown)", marginInlineStart: 8 }}>Sample members and you. Only public hub data is shown.</span>
      </div>

      {state === "idle" && (
        <section style={{ marginTop: 48, border: "1px dashed var(--line)", borderRadius: 20, padding: 48, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
          <Character name="Gripp" size={96} />
          <div><div className="serif" style={{ font: "italic 200 40px/1.05 var(--serif)" }}>Type a name and I will fetch it.</div><p style={{ margin: "8px 0 0", color: "var(--soft)", maxWidth: "48ch" }}>Gripp checks the wall for the exact handle. Your Discord name and your hub handle are the same once you have linked.</p></div>
        </section>
      )}
      {state === "loading" && (
        <section aria-live="polite" style={{ marginTop: 48, background: "#202020", color: "#F4F1EC", borderRadius: 20, padding: "64px 48px" }}>
          <div className="label" style={{ color: "#B9986A" }}>Checking the wall</div>
          <div className="serif" style={{ font: "200 56px/1 var(--serif)", marginTop: 12 }}>Looking for <i>@{shown}</i></div>
          <div style={{ height: 4, background: "rgba(244,241,236,.15)", marginTop: 28, borderRadius: 9, overflow: "hidden" }}><div className="scan" style={{ height: "100%", width: "40%", background: "#B9986A" }} /></div>
        </section>
      )}
      {state === "missing" && (
        <section style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 32 }}>
          <div style={{ flex: "1 1 460px", background: "#202020", color: "#F4F1EC", borderRadius: 20, padding: 40, display: "flex", gap: 24, alignItems: "center" }}>
            <Character name="Glitch" size={120} />
            <div><div className="label" style={{ color: "#B9986A" }}>No match</div><div className="serif" style={{ font: "200 44px/1.02 var(--serif)", margin: "8px 0" }}>Nobody called <i>@{shown}</i> on the wall yet.</div><p style={{ margin: 0, color: "rgba(244,241,236,.7)" }}>Check the spelling, or this operator has not played a ranked run.</p></div>
          </div>
          <div className="hpanel" style={{ flex: "1 1 360px", padding: 32 }}>
            <div className="label bronze">That is you?</div>
            <div className="serif" style={{ font: "200 36px/1.05 var(--serif)", margin: "8px 0 12px" }}>Play one ranked game to appear.</div>
            <Link href="/games" className="btn">Open the library</Link>
          </div>
        </section>
      )}
      {state === "found" && found && tier && spark && (
        <>
          <section aria-label="Result" style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "stretch" }}>
            <div style={{ flex: "1.15 1 560px", minWidth: 0, background: "#202020", color: "#F4F1EC", borderRadius: 24, position: "relative", overflow: "hidden", padding: "36px 40px" }}>
              <svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: "auto 0 0 0", width: "100%", height: "45%" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".2" /></svg>
              <div style={{ position: "relative" }}>
                <div className="between" style={{ alignItems: "flex-start" }}>
                  <div className="row" style={{ gap: 16 }}><Avatar handle={found.handle} size={72} /><div><div style={{ fontSize: 20, fontWeight: 600 }}>@{found.handle}</div><div className="label" style={{ color: "#B9986A", marginTop: 2 }}>Squad {found.squad} · since {found.since}</div></div></div>
                  <span className="label" style={{ border: "1px solid #B9986A", color: "#B9986A", borderRadius: 999, padding: "6px 12px" }}>{found.self ? "You" : "Public"}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-end", marginTop: 36 }}>
                  <div>
                    <div className="label" style={{ color: "#B9986A" }}>Overall rank</div>
                    <div className="serif" style={{ font: "200 clamp(120px, 14vw, 200px)/.85 var(--serif)", letterSpacing: "-.05em" }}>#{found.rank}</div>
                    <div className="label" style={{ color: "rgba(244,241,236,.65)", marginTop: 8 }}>of {found.total} operators · top {Math.max(1, Math.round((found.rank / found.total) * 100))}%</div>
                  </div>
                  <div style={{ flex: "1 1 220px", minWidth: 200 }}>
                    <div className="label" style={{ color: "#B9986A", marginBottom: 6 }}>Rank, last 12 days</div>
                    <svg viewBox="0 0 300 90" role="img" aria-label="Rank over the last twelve days" style={{ width: "100%", display: "block" }}><path d={spark.fill} fill="#B9986A" fillOpacity=".12" /><path d={spark.line} fill="none" stroke="#B9986A" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" /><circle cx={spark.x} cy={spark.y} r="5" fill="#F4F1EC" /></svg>
                    <div className="label" style={{ display: "flex", justifyContent: "space-between", color: "rgba(244,241,236,.55)" }}><span>#{spark.from}</span><span>{spark.delta > 0 ? `up ${spark.delta}` : "steady"}</span></div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderTop: "1px solid rgba(244,241,236,.25)", marginTop: 32 }}>
                  {[["Tier", <i key="t">{tier.name}</i>], ["Hub points", found.hp.toLocaleString()], ["Level", found.level], ["Streak", <>{found.streak}<span style={{ fontSize: 16 }}> days</span></>]].map(([k, v], i) => (
                    <div key={String(k)} style={{ padding: i ? "16px 0 16px 18px" : "16px 0", borderInlineStart: i ? "1px solid rgba(244,241,236,.18)" : 0 }}><div className="label" style={{ color: "#B9986A" }}>{k}</div><div className="serif" style={{ font: "200 34px/1.1 var(--serif)" }}>{v}</div></div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div className="label between" style={{ color: "rgba(244,241,236,.7)" }}><span>{tier.name}</span><span>{nt ? `${nt.name} at ${nt.from.toLocaleString()}` : "Top tier"}</span></div>
                  <div style={{ height: 8, border: "1px solid rgba(244,241,236,.4)", borderRadius: 999, padding: 1, marginTop: 8 }}><div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "#B9986A" }} /></div>
                </div>
              </div>
            </div>
            <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="hpanel" style={{ borderRadius: 20 }}>
                <div className="between"><h2 className="disp2" style={{ margin: 0, fontSize: 34, lineHeight: 1 }}>Around <i>them</i></h2><span className="label muted">Overall board</span></div>
                <div style={{ borderTop: "1px solid var(--ink)", marginTop: 14 }}>
                  {near.map((n) => (
                    <div key={n.handle} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "11px 8px", borderBottom: "1px solid var(--line)", background: n.handle === found.handle ? "color-mix(in srgb, var(--cream) 70%, transparent)" : undefined }}>
                      <span className="label bronze" style={{ width: 40 }}>#{n.rank}</span><span style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 13 }}>@{n.handle}</span><span style={{ font: "200 24px var(--serif)" }}>{n.hp.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hpanel" style={{ borderRadius: 20 }}>
                <div className="label bronze" style={{ marginBottom: 14 }}>Play style</div>
                <div style={{ display: "grid", gap: 14 }}>
                  {found.stats.map(([k, v]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 14 }}><span className="label" style={{ width: 96 }}>{k}</span><span style={{ flex: 1, height: 6, background: "var(--cream)", borderRadius: 9, overflow: "hidden", display: "block" }}><span style={{ display: "block", height: "100%", width: `${v}%`, background: "var(--ink)" }} /></span><span style={{ width: 36, textAlign: "end", font: "200 24px var(--serif)" }}>{v}</span></div>)}
                </div>
                <div className="row" style={{ gap: 8, marginTop: 20 }}>{found.roles.map((r) => <span key={r} className="label" style={{ border: "1px solid var(--ink)", borderRadius: 999, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 8 }}><i style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bronze)", display: "inline-block" }} />{r}</span>)}</div>
                <div className="label muted" style={{ marginTop: 12 }}>Roles come from the hub. Read only.</div>
              </div>
            </div>
          </section>

          <section style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            <div style={{ flex: "1 1 380px", minWidth: 0 }}>
              <div className="label bronze">In the server</div>
              <h2 className="disp2" style={{ margin: "12px 0 14px", fontSize: 56, lineHeight: 1 }}>Same result with <i>/stats</i></h2>
              <p style={{ margin: 0, color: "var(--soft)", maxWidth: "42ch" }}>Dot answers in the channel with the same numbers. Nothing here is a reward. It is a scoreboard.</p>
            </div>
            <div style={{ flex: "1.3 1 520px", minWidth: 0, background: "#2a2724", color: "#F4F1EC", borderRadius: 18, padding: "24px 26px", border: "1px solid rgba(244,241,236,.12)" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <Character name="Dot" size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}><b>Dot</b> <span className="label" style={{ background: "#B56654", color: "#F4F1EC", borderRadius: 4, padding: "2px 6px", margin: "0 6px" }}>App</span><span style={{ color: "rgba(244,241,236,.55)", fontSize: 12 }}>/stats @{found.handle}</span></div>
                  <div style={{ display: "flex", marginTop: 10, background: "#211f1c", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: 4, background: "#B56654", flex: "none" }} />
                    <div style={{ padding: "14px 18px 16px", flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{found.handle} · Tier {tier.name}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 10, fontSize: 13 }}>
                        <div><div style={{ color: "rgba(244,241,236,.55)", fontSize: 11 }}>Hub Points</div>{found.hp.toLocaleString()}</div>
                        <div><div style={{ color: "rgba(244,241,236,.55)", fontSize: 11 }}>Level</div>{found.level}</div>
                        <div><div style={{ color: "rgba(244,241,236,.55)", fontSize: 11 }}>Squad</div>{found.squad}</div>
                        <div><div style={{ color: "rgba(244,241,236,.55)", fontSize: 11 }}>Streak</div>{found.streak} days</div>
                        <div><div style={{ color: "rgba(244,241,236,.55)", fontSize: 11 }}>Rank</div>#{found.rank}</div>
                        <div><div style={{ color: "rgba(244,241,236,.55)", fontSize: 11 }}>Games played</div>{Math.min(20, Math.max(1, Math.round(found.level / 2)))}/{GAMES.length}</div>
                      </div>
                      <div style={{ marginTop: 10, fontSize: 11, color: "rgba(244,241,236,.5)" }}>Hub Points are a community game score, not an official PrismaX reward.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section style={{ marginTop: 72 }}>
        <div className="pagehead" style={{ paddingBottom: 20 }}><div><div className="label bronze">Dot · herald</div><h2 className="disp2" style={{ margin: "10px 0 0", fontSize: "clamp(40px, 4.6vw, 64px)", lineHeight: 1 }}>The Discord <i>bot</i></h2></div><Character name="Dot" size={72} /></div>
        <p className="muted" style={{ maxWidth: "56ch" }}>Add Dot to your server so members can look up each other&apos;s hub stats right in chat. The bot reads no messages, joins no voice channels and needs no permissions. It only answers slash commands.</p>
        <div className="row" style={{ margin: "16px 0" }}>
          {INVITE ? <a className="btn" href={INVITE} target="_blank" rel="noopener noreferrer">Add the bot to Discord</a> : <span className="btn alt" aria-disabled="true">Invite link appears once the bot is configured</span>}
        </div>
        <div className="grid g2">
          <div className="panel"><h3>Commands</h3><table className="t"><tbody>{CMDS.map(([c, d]) => <tr key={c}><td className="mono" style={{ whiteSpace: "nowrap" }}>{c}</td><td>{d}</td></tr>)}</tbody></table></div>
          <div className="panel">
            <h3>Link your account {linked && <span className="label bronze"> · linked</span>}</h3>
            {linked ? (
              <>
                <p className="muted">Your summary syncs after every run. Only your handle, points, level, tier, squad, run counts, streak, badges and bests are shared.</p>
                <div className="row"><button className="btn" onClick={() => { syncToDiscord(); setMsg("Synced now."); }}>Sync now</button>
                  <button className="btn alt" onClick={() => { update((x) => ({ ...x, profile: x.profile && { ...x.profile, discordToken: undefined } })); setMsg("Unlinked on this device."); }}>Unlink</button></div>
              </>
            ) : (
              <>
                <ol style={{ paddingInlineStart: 20 }}><li>In Discord, run <b className="mono">/link</b>. The bot privately sends you a 6 digit code.</li><li>Enter the code here within 10 minutes.</li></ol>
                <div className="row"><input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-label="Link code" /><button className="btn" disabled={code.length !== 6} onClick={link}>Link</button></div>
              </>
            )}
            <p className="note" role="status">{msg}</p>
          </div>
        </div>
        <div className="panel" style={{ marginTop: 16 }}><h3>For server owners: setup in 6 steps</h3>
          <ol style={{ paddingInlineStart: 20, lineHeight: 1.7 }}>
            <li>Create an application at discord.com/developers/applications. Copy the <b>Application ID</b> and <b>Public Key</b>.</li>
            <li>Add a Bot to it and copy the bot token (keep it secret, it is only used to register commands).</li>
            <li>In the hub&apos;s Vercel project set <span className="mono">DISCORD_PUBLIC_KEY</span>, <span className="mono">NEXT_PUBLIC_DISCORD_APP_ID</span>, <span className="mono">UPSTASH_REDIS_REST_URL</span>, <span className="mono">UPSTASH_REDIS_REST_TOKEN</span> and <span className="mono">RUN_SECRET</span>, then redeploy.</li>
            <li>In the Discord application set <b>Interactions Endpoint URL</b> to <span className="mono">https://YOUR-SITE/api/discord/interactions</span>. Discord pings it to verify.</li>
            <li>Register the commands once: <span className="mono">DISCORD_APP_ID=… DISCORD_BOT_TOKEN=… node scripts/register-commands.mjs</span></li>
            <li>Open the invite link above and add the bot to your server.</li>
          </ol>
          <p className="note">Storage (Upstash Redis) is required for /stats and /leaderboard, because the bot has to remember members between visits.</p></div>
      </section>
    </div>
  );
}
