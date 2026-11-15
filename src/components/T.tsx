"use client";
import { useStore } from "@/lib/store";
import { tr } from "@/lib/i18n";
/** Translated text that follows the member's language. */
export function T({ k }: { k: string }) { const l = useStore().profile?.locale ?? "en"; return <>{tr(k, l)}</>; }
/** Headline: the last word is set in italic for English, as the brand asks. Persian has no italics. */
export function TI({ k }: { k: string }) {
  const l = useStore().profile?.locale ?? "en";
  const t = tr(k, l);
  if (l === "fa") return <>{t}</>;
  const i = t.lastIndexOf(" ");
  return <>{t.slice(0, i + 1)}<i>{t.slice(i + 1)}</i></>;
}
