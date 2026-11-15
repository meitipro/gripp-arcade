import { NextResponse } from "next/server";
import { hasRedis, redis, sign } from "@/lib/server";

export const dynamic = "force-dynamic";
/** The site trades the 6 digit code from /link for a signed sync token tied to that Discord id. */
export async function POST(req: Request) {
  if (!hasRedis()) return NextResponse.json({ error: "Storage is not connected on this deployment." }, { status: 503 });
  const { code } = await req.json().catch(() => ({}));
  if (!/^\d{6}$/.test(String(code))) return NextResponse.json({ error: "Enter the 6 digit code" }, { status: 400 });
  const key = `linkcode:${code}`;
  const id = await redis(["GET", key]);
  if (!id) return NextResponse.json({ error: "Code not found or expired. Run /link again." }, { status: 404 });
  await redis(["DEL", key]);
  return NextResponse.json({ ok: true, token: sign({ did: String(id), t: Date.now() }) });
}
