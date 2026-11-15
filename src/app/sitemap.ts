import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gripp-arcade.vercel.app";
  const pages = ["", "/games", "/daily", "/season", "/boards", "/wall", "/squads", "/quests", "/rules", "/discord"];
  return [...pages.map((p) => ({ url: base + p })), ...GAMES.map((g) => ({ url: `${base}/games/${g.id}` }))];
}
