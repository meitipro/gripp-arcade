import { cardSvg, cleanHandle } from "@/lib/card";
import { levelFor } from "@/lib/points";
import { SQUADS } from "@/lib/catalog";

export const dynamic = "force-dynamic";
/** Public share image: /api/card/image?h=handle&hp=1200&sq=IR (cards are public, one at a time). */
export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const n = (k: string, d: number, max: number) => Math.max(0, Math.min(max, Math.floor(Number(q.get(k) ?? d)) || d));
  const hp = n("hp", 0, 1e7);
  const sq = SQUADS.some((s) => s.code === q.get("sq")) ? q.get("sq")! : "GL";
  const st = (k: string) => Math.max(20, Math.min(100, n(k, 20, 100)));
  const svg = cardSvg({ handle: cleanHandle(q.get("h") || "operator"), hp, level: levelFor(hp), squad: sq, serial: n("no", 1, 99999), since: "NOV 2026",
    stats: { Precision: st("p"), Speed: st("s"), Brain: st("b"), Community: st("c") }, badges: (q.get("bd") || "").split(",").filter(Boolean).slice(0, 3) });
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, s-maxage=3600" } });
}
