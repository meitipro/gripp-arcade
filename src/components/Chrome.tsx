"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Gripp } from "./Logo";
import { totalHp, update, useStore } from "@/lib/store";
import { Avatar } from "./Avatar";
import { tr } from "@/lib/i18n";
import { hashString } from "@/lib/rng";
import dynamic from "next/dynamic";
const Onboarding = dynamic(() => import("./Onboarding"), { ssr: false });

const LINKS: [string, string][] = [["/home", "home"], ["/games", "games"], ["/boards", "boards"], ["/season", "season"], ["/wall", "wall"], ["/card", "card"]];
const FOOT: [string, string][] = [["/daily", "Daily Five"], ["/quests", "Quests"], ["/squads", "Squads"], ["/me", "Progress"], ["/discord", "Discord bot"], ["/rules", "Rules"], ["/settings", "Settings"], ["/staff", "Staff"]];

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
          <Link href="/" className="brand"><Gripp /> <span>Gripp <i>Arcade</i></span></Link>
          <div className="navlinks">
            {LINKS.map(([href, k]) => (
              <Link key={href} href={href} className={path === href || (href !== "/home" && path.startsWith(href + "/")) ? "on" : ""}>{tr(k, locale)}</Link>
            ))}
          </div>
          <Link href="/me" className="hp" aria-label="Hub Points"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0 L12 6 L6 12 L0 6Z" fill="#B56654" /></svg>{totalHp(s).toLocaleString()} HP</Link>
          <Link href="/card" className="avatarlink" aria-label="My card"><Avatar handle={s.profile?.handle ?? "operator"} size={40} /></Link>
          <button className="themebtn" onClick={toggleTheme} aria-label={`Switch between light and dark theme (current: ${theme || "auto"})`} title="Light / dark"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /></svg></button>
        </div>
      </nav>
      <div className="toastwrap" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toastitem">{t.m}</div>)}</div>
      {s.profile && !s.profile.onboarded && s.ledger.length === 0 && <Onboarding />}
      <main id="main">{children}</main>
      <footer>
        <div className="wrap">
          <ul className="flinks">{FOOT.map(([h, l]) => <li key={h}><Link href={h}>{l}</Link></li>)}</ul>
          <p>{tr("unofficial", locale)} {tr("hpnote", locale)}</p>
          <p className="mono">Gripp Arcade · Season 0 · Calibration</p>
        </div>
      </footer>
    </>
  );
}
