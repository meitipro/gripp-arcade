"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Gripp } from "./Logo";
import { update, useStore } from "@/lib/store";
import { tr } from "@/lib/i18n";
import { hashString } from "@/lib/rng";

const LINKS: [string, string][] = [["/games", "games"], ["/daily", "daily"], ["/card", "card"], ["/boards", "boards"], ["/wall", "wall"], ["/squads", "squads"], ["/quests", "quests"], ["/rules", "rules"], ["/settings", "settings"]];

export function Chrome({ children }: { children: React.ReactNode }) {
  const s = useStore();
  const path = usePathname();
  const locale = s.profile?.locale ?? "en";
  useEffect(() => {
    if (!s.profile) {
      const id = Math.floor(Math.random() * 9000 + 1000);
      update((st) => st.profile ? st : { ...st, profile: { handle: `operator${id}`, face: "robot", squad: "GL", locale: "en", calm: false, joined: "NOV 2026", serial: 800 + (hashString(String(id)) % 900), pinned: [] } });
    }
  }, [s.profile]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("calm", !!s.profile?.calm);
  }, [locale, s.profile?.calm]);
  return (
    <>
      <a href="#main" style={{ position: "absolute", left: -999 }} onFocus={(e) => (e.currentTarget.style.left = "8px")}>Skip to content</a>
      <nav className="nav" aria-label="Main">
        <div className="wrap">
          <Link href="/" className="brand"><Gripp /> Gripp Arcade</Link>
          {LINKS.map(([href, k]) => (
            <Link key={href} href={href} className={path === href || path.startsWith(href + "/") ? "on" : ""}>{tr(k, locale)}</Link>
          ))}
        </div>
      </nav>
      <main id="main">{children}</main>
      <footer>
        <div className="wrap">
          <p>{tr("unofficial", locale)} {tr("hpnote", locale)}</p>
          <p className="mono">Gripp Arcade · Season 0 · Calibration</p>
        </div>
      </footer>
    </>
  );
}
