import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cardSvg } from "@/lib/card";
import { SAMPLE_HANDLES, sampleMembers } from "@/lib/members";
import { levelFor, tierFor } from "@/lib/points";
import { hashString, mulberry32 } from "@/lib/rng";

export const dynamicParams = false;
export function generateStaticParams() { return SAMPLE_HANDLES.map((handle) => ({ handle })); }
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params; const h = decodeURIComponent(handle); const m = sampleMembers().find((x) => x.handle === h);
  return { title: `@${h}`, description: "A sample operator card from Gripp Arcade.", openGraph: { images: [`/api/card/png?h=${h}&hp=${m?.hp ?? 0}&sq=${m?.squad ?? "GL"}&no=${m?.serial ?? 1}`] } };
}
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const handle = decodeURIComponent((await params).handle);
  const m = sampleMembers().find((x) => x.handle === handle);
  if (!m) notFound();
  const r = mulberry32(hashString(handle + "stats"));
  const st = () => 30 + Math.floor(r() * 60);
  const svg = cardSvg({ handle, hp: m.hp, level: levelFor(Math.floor(m.hp * 1.1)), squad: m.squad, serial: m.serial, since: m.joined, stats: { Precision: st(), Speed: st(), Brain: st(), Community: st() }, badges: ["First Run", "Steady"].slice(0, tierFor(m.hp).n > 1 ? 2 : 1) });
  return (
    <div className="wrap"><section className="block" style={{ textAlign: "center" }}>
      <div className="label">Public card · one at a time</div>
      <div style={{ width: 340, maxWidth: "100%", margin: "16px auto" }} dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="muted">@{handle} is a sample member. Names and faces are placeholders, not real people.</p>
      <Link className="btn" href="/games">Earn your own card</Link>
    </section></div>
  );
}
