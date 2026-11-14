import { NextResponse } from "next/server";
import { dailyFive } from "@/lib/daily";
export const dynamic = "force-dynamic";
/** Secret-protected scheduled job: reports today's Daily Five. Hook to Dot webhook later. */
export function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ day: new Date().toISOString().slice(0, 10), dailyFive: dailyFive() });
}
