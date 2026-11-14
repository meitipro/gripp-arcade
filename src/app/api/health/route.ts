import { NextResponse } from "next/server";
import { hasRedis } from "@/lib/server";
export const dynamic = "force-dynamic";
export function GET() { return NextResponse.json({ ok: true, redis: hasRedis(), time: new Date().toISOString() }); }
