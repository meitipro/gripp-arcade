import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { COLOR, MemberSummary, NOTE, reply, verifyDiscordSignature } from "@/lib/discord";
import { hasRedis, redis } from "@/lib/server";
import { GAMES } from "@/lib/catalog";
import { dailyFive } from "@/lib/daily";

export const dynamic = "force-dynamic";

const site = () => process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
const noStore = () => reply({ content: "The hub storage is not connected yet, so I cannot remember members. Ask the admins to set the Upstash Redis variables." }, true);
const loadMember = async (id: string): Promise<MemberSummary | null> => { const raw = await redis(["GET", `member:${id}`]); try { return raw ? JSON.parse(raw) : null; } catch { return null; } };

export async function POST(req: Request) {
  const pk = process.env.DISCORD_PUBLIC_KEY;
  if (!pk) return NextResponse.json({ error: "DISCORD_PUBLIC_KEY not set" }, { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get("x-signature-ed25519") ?? "", ts = req.headers.get("x-signature-timestamp") ?? "";
  if (!sig || !ts || !verifyDiscordSignature(pk, sig, ts, raw)) return new NextResponse("invalid request signature", { status: 401 });
  const i = JSON.parse(raw);
  if (i.type === 1) return NextResponse.json({ type: 1 });           // PING
  if (i.type !== 2) return NextResponse.json({ type: 1 });
  const name: string = i.data?.name;
  const invoker: string = i.member?.user?.id ?? i.user?.id;
  const opt = (n: string) => i.data?.options?.find((o: any) => o.name === n)?.value;

  if (name === "about") {
    return reply({ embeds: [{ title: "Gripp Arcade", color: COLOR, description: `Twenty small games, an operator card and weekly squads for the PrismaX community.\n${site() ? `Play: ${site()}` : ""}`, footer: { text: NOTE } }] });
  }
  if (name === "daily") {
    const list = dailyFive().map((id, k) => `${k + 1}. **${GAMES.find((g) => g.id === id)?.name}**`).join("\n");
    return reply({ embeds: [{ title: "Today's Daily Five", color: COLOR, description: `${list}\n\n1 game +10 HP, 3 games +30 HP, all 5 +100 HP.${site() ? `\n${site()}/daily` : ""}`, footer: { text: NOTE } }] });
  }
  if (name === "link") {
    if (!hasRedis()) return noStore();
    const code = crypto.randomInt(100000, 999999).toString();
    await redis(["SET", `linkcode:${code}`, invoker, "EX", 600]);
    return reply({ content: `Your link code is **${code}**. Open ${site() || "the hub"}/settings, enter it under Discord, and your runs will show up in /stats. It expires in 10 minutes.` }, true);
  }
  if (name === "stats") {
    if (!hasRedis()) return noStore();
    const target: string = opt("member") ?? invoker;
    const m = await loadMember(target);
    if (!m) return reply({ content: target === invoker ? "You have not linked an account yet. Use `/link`, then enter the code on the hub settings page." : "That member has not linked an account to the hub yet." }, true);
    const topGames = Object.entries(m.bests).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, v]) => `${GAMES.find((g) => g.id === id)?.name ?? id}: ${v.toLocaleString()}`).join("\n") || "No bests yet";
    return reply({ embeds: [{
      title: `@${m.handle} · Tier ${m.tier}`, color: COLOR, url: site() ? `${site()}/card/${m.handle}` : undefined,
      thumbnail: site() ? { url: `${site()}/api/card/image?h=${m.handle}&hp=${m.hp}&sq=${m.squad}` } : undefined,
      fields: [
        { name: "Hub Points", value: m.hp.toLocaleString(), inline: true }, { name: "Level", value: String(m.level), inline: true }, { name: "Squad", value: m.squad, inline: true },
        { name: "Ranked runs", value: m.runs.toLocaleString(), inline: true }, { name: "Streak", value: `${m.streak} days`, inline: true }, { name: "Games played", value: `${m.gamesPlayed}/20`, inline: true },
        { name: "Badges", value: m.badges.length ? m.badges.join(", ") : "None yet", inline: false },
        { name: "Pixel Wall tiles", value: String(m.wallTiles), inline: true }, { name: "Boss damage", value: m.bossDmg.toLocaleString(), inline: true },
        { name: "Top games", value: topGames, inline: false },
      ], footer: { text: NOTE },
    }] });
  }
  if (name === "leaderboard") {
    if (!hasRedis()) return noStore();
    const rows = ((await redis(["ZREVRANGE", "board:overall", 0, 9, "WITHSCORES"])) as string[] | null) ?? [];
    const lines: string[] = [];
    for (let k = 0; k < rows.length; k += 2) { const m = await loadMember(rows[k]); lines.push(`${k / 2 + 1}. **@${m?.handle ?? "operator"}** · ${Number(rows[k + 1]).toLocaleString()} HP`); }
    return reply({ embeds: [{ title: "Top operators", color: COLOR, description: lines.join("\n") || "Nobody has linked yet. Be the first with `/link`.", footer: { text: NOTE } }] });
  }
  return reply({ content: "Unknown command." }, true);
}
