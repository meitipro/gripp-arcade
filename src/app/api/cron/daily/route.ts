import { NextResponse } from "next/server";
import { dailyFive } from "@/lib/daily";
import { GAMES } from "@/lib/catalog";

export const dynamic = "force-dynamic";
/** Midnight UTC job. If DISCORD_WEBHOOK_URL is set, Dot posts the new Daily Five to the community channel. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const day = new Date().toISOString().slice(0, 10);
  const five = dailyFive(day);
  let posted = false;
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (hook) {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "";
    const list = five.map((id, i) => `${i + 1}. **${GAMES.find((g) => g.id === id)?.name}**`).join("\n");
    const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "Dot", allowed_mentions: { parse: [] },
      embeds: [{ title: `Daily Five · ${day}`, color: 0xb56654, description: `${list}\n\n${site ? site + "/daily" : ""}`, footer: { text: "Community-built, unofficial. Hub Points are a community game score." } }] }) });
    posted = r.ok;
  }
  return NextResponse.json({ day, dailyFive: five, posted });
}
