import { NextResponse } from "next/server";
import { gameById } from "@/lib/catalog";
import { hasRedis, redis } from "@/lib/server";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const game = new URL(req.url).searchParams.get("game") || "";
  if (!gameById(game)) return NextResponse.json({ error: "unknown game" }, { status: 400 });
  if (!hasRedis()) return NextResponse.json({ shared: false, rows: [] });
  const raw = (await redis(["ZREVRANGE", `board:${game}`, 0, 49, "WITHSCORES"])) as string[] | null;
  const rows: { handle: string; score: number }[] = [];
  for (let i = 0; raw && i < raw.length; i += 2) rows.push({ handle: raw[i], score: Number(raw[i + 1]) });
  return NextResponse.json({ shared: true, rows }, { headers: { "Cache-Control": "s-maxage=5, stale-while-revalidate=30" } });
}
