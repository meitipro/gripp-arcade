import { NextResponse } from "next/server";
import { gameById } from "@/lib/catalog";
import { hasRedis, redis, useOnce, verify } from "@/lib/server";

export const dynamic = "force-dynamic";
/** Verify a ranked run: signed token, single use, time floor, range check. Returns a verdict, never trusts the client number blindly. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b.token !== "string") return NextResponse.json({ error: "bad request" }, { status: 400 });
  const tok = verify<{ id: string; game: string; seed: number; t: number }>(b.token);
  if (!tok) return NextResponse.json({ error: "invalid token" }, { status: 400 });
  const g = gameById(tok.game);
  if (!g) return NextResponse.json({ error: "unknown game" }, { status: 400 });
  const score = Number(b.score);
  const elapsed = Date.now() - tok.t;
  if (!Number.isFinite(score) || score < 0) return NextResponse.json({ error: "bad score" }, { status: 400 });
  if (elapsed > 3 * 3600_000) return NextResponse.json({ error: "run expired" }, { status: 410 });
  const first = await useOnce(tok.id);
  if (!first) return NextResponse.json({ status: "duplicate", note: "This run id was already used." });
  let status: "counted" | "held" = "counted";
  const reasons: string[] = [];
  if (score > g.maxScore) { status = "held"; reasons.push("score above human range"); }
  if (elapsed < g.minMs && score > 0) { status = "held"; reasons.push("finished faster than the human floor"); }
  if (status === "counted" && hasRedis() && b.handle && typeof b.handle === "string" && /^[\w.\-]{2,24}$/.test(b.handle)) {
    // keep each member's best per game on the shared board
    const key = `board:${g.id}`;
    const cur = Number(await redis(["ZSCORE", key, b.handle]));
    if (!(cur >= score)) await redis(["ZADD", key, score, b.handle]);
  }
  return NextResponse.json({ status, id: tok.id, reasons, shared: hasRedis() });
}
