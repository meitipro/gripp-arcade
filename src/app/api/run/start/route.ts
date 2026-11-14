import { NextResponse } from "next/server";
import { gameById } from "@/lib/catalog";
import { sign } from "@/lib/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const { game } = await req.json().catch(() => ({}));
  const g = typeof game === "string" ? gameById(game) : undefined;
  if (!g) return NextResponse.json({ error: "unknown game" }, { status: 400 });
  const seed = crypto.randomInt(1, 2 ** 31 - 1);
  const id = crypto.randomUUID();
  const t = Date.now();
  const token = sign({ id, game: g.id, seed, t });
  return NextResponse.json({ id, seed, token, t });
}
