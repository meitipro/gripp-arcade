import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog";
export const metadata: Metadata = { title: "Games" };
export default function Page() {
  return (<div className="wrap"><section className="block"><h1>The twenty games</h1><p className="muted">Five kinds of play, so every mood has a home. Games run in your browser and never call the network themselves.</p><Catalog /></section></div>);
}
