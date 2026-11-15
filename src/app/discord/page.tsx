"use client";
import { PageHead } from "@/components/PageHead";
import { useState } from "react";
import { update, useStore } from "@/lib/store";
import { syncToDiscord } from "@/lib/sync";
import { Character } from "@/components/Cast";

const APP_ID = process.env.NEXT_PUBLIC_DISCORD_APP_ID;
const INVITE = APP_ID ? `https://discord.com/oauth2/authorize?client_id=${APP_ID}&scope=applications.commands%20bot&permissions=0` : "";
const CMDS = [
  ["/stats [member]", "Hub Points, level, tier, squad, ranked runs, streak, games played, badges, wall tiles, boss damage and top games"],
  ["/leaderboard", "Top ten operators by Hub Points"],
  ["/daily", "Today's Daily Five"],
  ["/link", "Get a private 6 digit code to link your hub account"],
  ["/about", "What the hub is"],
];

export default function Page() {
  const s = useStore();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const linked = !!s.profile?.discordToken;
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
  return (
    <div className="wrap"><section className="block" style={{ maxWidth: 760 }}>
      <PageHead kicker="Dot · herald" title="Discord bot" aside={<Character name="Dot" size={72} />} />
      <p className="muted">Add Dot to your server so members can look up each other&apos;s hub stats right in chat. The bot reads no messages, joins no voice channels and needs no permissions. It only answers slash commands.</p>
      <div className="row" style={{ margin: "16px 0" }}>
        {INVITE ? <a className="btn bronze" href={INVITE} target="_blank" rel="noopener noreferrer">Add the bot to Discord</a> : <span className="btn alt" aria-disabled>Invite link appears once the bot is configured</span>}
      </div>
      <div className="panel"><h3>Commands</h3><table className="t"><tbody>{CMDS.map(([c, d]) => <tr key={c}><td className="mono" style={{ whiteSpace: "nowrap" }}>{c}</td><td>{d}</td></tr>)}</tbody></table></div>
      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Link your account {linked && <span className="mono" style={{ color: "var(--bronze)" }}> · linked</span>}</h3>
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
    </section></div>
  );
}
