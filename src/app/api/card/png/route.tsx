import { ImageResponse } from "next/og";
import { cardSvg, cleanHandle } from "@/lib/card";
import { levelFor } from "@/lib/points";
import { SQUADS } from "@/lib/catalog";

export const dynamic = "force-dynamic";
/** PNG share image (Discord, X and chat apps do not render SVG). Same query as /api/card/image. */
export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const n = (k: string, d: number, max: number) => Math.max(0, Math.min(max, Math.floor(Number(q.get(k) ?? d)) || d));
  const hp = n("hp", 0, 1e7);
  const sq = SQUADS.some((s) => s.code === q.get("sq")) ? q.get("sq")! : "GL";
  const st = (k: string) => Math.max(20, Math.min(100, n(k, 20, 100)));
  const svg = cardSvg({ handle: cleanHandle(q.get("h") || "operator"), hp, level: levelFor(hp), squad: sq, serial: n("no", 1, 99999), since: "NOV 2026",
    stats: { Precision: st("p"), Speed: st("s"), Brain: st("b"), Community: st("c") }, badges: (q.get("bd") || "").split(",").filter(Boolean).slice(0, 3) });
  const src = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  return new ImageResponse(
    (<div style={{ display: "flex", width: "100%", height: "100%", background: "#DFD8D0", alignItems: "center", justifyContent: "center" }}><img src={src} width={500} height={700} alt="" /></div>),
    { width: 600, height: 760, headers: { "Cache-Control": "public, s-maxage=3600" } },
  );
}
