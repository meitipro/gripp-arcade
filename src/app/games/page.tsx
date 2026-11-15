import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { Catalog } from "@/components/Catalog";
export const metadata: Metadata = { title: "Games" };
export default function Page() {
  return (
    <div className="wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
      <PageHead kicker="Library · Season 0" title="Twenty small games" />
      <Catalog />
      <p className="muted" style={{ fontSize: 13, marginTop: 24 }}>Games run in your browser and never call the network themselves. Hub Points are a community game score, not an official PrismaX reward.</p>
    </div>
  );
}
