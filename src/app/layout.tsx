import type { Metadata, Viewport } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { Chrome } from "@/components/Chrome";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Gripp Arcade", template: "%s · Gripp Arcade" },
  description: "Twenty small games, one operator card and a cast of small robots. A community-built game hub for PrismaX (unofficial).",
};
export const viewport: Viewport = { themeColor: "#F4F1EC", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body><Chrome>{children}</Chrome></body>
    </html>
  );
}
