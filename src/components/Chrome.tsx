"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Gripp } from "./Logo";
import { update, useStore } from "@/lib/store";
import { tr } from "@/lib/i18n";
import { hashString } from "@/lib/rng";
import dynamic from "next/dynamic";
const Onboarding = dynamic(() => import("./Onboarding"), { ssr: false });

const LINKS: [string, string][] = [["/games", "games"], ["/season", "season"], ["/daily", "daily"], ["/card", "card"], ["/me", "me"], ["/boards", "boards"], ["/wall", "wall"], ["/squads", "squads"], ["/quests", "quests"], ["/discord", "discord"], ["/rules", "rules"], ["/settings", "settings"]];

export function Chrome({ children }: { children: React.ReactNode }) {
  const s = useStore();
  const path = usePathname();
  const locale = s.profile?.locale ?? "en";
  const [toasts, setToasts] = useState<{ id: number; m: string }[]>([]);
  useEffect(() => {
    const f = (e: Event) => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, m: String((e as CustomEvent).detail) }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800); };
    window.addEventListener("gripp:toast", f); return () => window.removeEventListener("gripp:toast", f);
  }, []);
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
  const [theme, setTheme] = useState<string>("");
  useEffect(() => { try { setTheme(localStorage.getItem("gripp-theme") || ""); } catch {} }, []);
  const toggleTheme = () => { const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches); const next = dark ? "light" : "dark"; document.documentElement.dataset.theme = next; try { localStorage.setItem("gripp-theme", next); } catch {} setTheme(next); };
  return (
    <>
      <a href="#main" style={{ position: "absolute", left: -999 }} onFocus={(e) => (e.currentTarget.style.left = "8px")}>Skip to content</a>
      <nav className="nav" aria-label="Main">
        <div className="wrap">
          <Link href="/" className="brand"><Gripp /> Gripp Arcade</Link>
          <button className="themebtn" onClick={toggleTheme} aria-label={`Switch theme (current: ${theme || "auto"})`} title="Light / dark">◐</button>
          {LINKS.map(([href, k]) => (
            <Link key={href} href={href} className={path === href || path.startsWith(href + "/") ? "on" : ""}>{tr(k, locale)}</Link>
          ))}
        </div>
      </nav>
      <div className="toastwrap" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toastitem">{t.m}</div>)}</div>
      {s.profile && !s.profile.onboarded && s.ledger.length === 0 && <Onboarding />}
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
