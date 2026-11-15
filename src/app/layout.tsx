import type { Metadata, Viewport } from "next";
import { Newsreader, Inter, JetBrains_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Chrome } from "@/components/Chrome";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"], weight: ["200", "300", "400", "500"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["500", "600"] });
const fa = Vazirmatn({ subsets: ["arabic"], variable: "--font-fa", display: "swap", weight: ["400", "600"] });
const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

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
