"use client";
import { useStore } from "@/lib/store";
import { tr } from "@/lib/i18n";
/** Translated text that follows the member's language. */
export function T({ k }: { k: string }) { const l = useStore().profile?.locale ?? "en"; return <>{tr(k, l)}</>; }
