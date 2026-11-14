"use client";
import { cardSvg, CardData } from "@/lib/card";
export function CardView({ data, width = 300 }: { data: CardData; width?: number }) {
  return <div style={{ width, maxWidth: "100%", filter: "drop-shadow(0 6px 18px rgba(32,32,32,.15))" }} dangerouslySetInnerHTML={{ __html: cardSvg(data) }} />;
}
