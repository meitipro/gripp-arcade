import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Chrome } from "@/components/Chrome";

// Self-hosted variable fonts: the build never depends on fetching fonts from Google.
const serif = localFont({
  src: [
    { path: "../fonts/newsreader-latin-normal.woff2", weight: "200 500", style: "normal" },
    { path: "../fonts/newsreader-latin-italic.woff2", weight: "200 500", style: "italic" },
  ],
  variable: "--font-serif", display: "swap", fallback: ["Georgia", "serif"],
});
const sans = localFont({ src: "../fonts/inter-latin-normal.woff2", weight: "100 900", variable: "--font-sans", display: "swap", fallback: ["system-ui", "sans-serif"] });
const mono = localFont({ src: "../fonts/jetbrains-latin-normal.woff2", weight: "100 800", variable: "--font-mono", display: "swap", fallback: ["ui-monospace", "Menlo", "monospace"] });
const fa = localFont({ src: "../fonts/vazirmatn-arabic-normal.woff2", weight: "100 900", variable: "--font-fa", display: "swap", fallback: ["Tahoma", "sans-serif"] });

export const metadata: Metadata = {
  title: { default: "Gripp Arcade", template: "%s · Gripp Arcade" },
  description: "Twenty small games, one operator card and a cast of small robots. A community-built game hub for PrismaX (unofficial).",
};
export const viewport: Viewport = { themeColor: "#F4F1EC", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${mono.variable} ${fa.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('gripp-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}" }} /></head>
      <body><Chrome>{children}</Chrome></body>
    </html>
  );
}
