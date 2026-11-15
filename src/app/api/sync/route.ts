import { NextResponse } from "next/server";
import { cleanSummary } from "@/lib/discord";
import { hasRedis, redis, verify } from "@/lib/server";

export const dynamic = "force-dynamic";
/** Linked members push a summary after each run so the Discord bot can show it. Summaries are clamped, never trusted as text. */
export async function POST(req: Request) {
  if (!hasRedis()) return NextResponse.json({ ok: false, reason: "no-storage" });
  const b = await req.json().catch(() => null);
  const tok = b && verify<{ did: string }>(String(b.token ?? ""));
  if (!tok?.did) return NextResponse.json({ error: "invalid token" }, { status: 401 });
  const sum = cleanSummary(b.summary);
  if (!sum) return NextResponse.json({ error: "bad summary" }, { status: 400 });
  const gate = await redis(["SET", `syncrate:${tok.did}`, "1", "NX", "EX", 3]);       // at most one write per 3 seconds
  if (gate !== "OK") return NextResponse.json({ ok: true, skipped: true });
  await redis(["SET", `member:${tok.did}`, JSON.stringify(sum)]);
  await redis(["ZADD", "board:overall", sum.hp, tok.did]);
  return NextResponse.json({ ok: true });
}
