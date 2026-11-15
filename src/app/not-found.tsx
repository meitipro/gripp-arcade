"use client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { floorPath } from "@/lib/motifs";

export default function NotFound() {
  useEffect(() => { document.body.dataset.dark = "1"; return () => { delete document.body.dataset.dark; }; }, []);
  const floor = useMemo(() => floorPath(1440, 600, 16, 12), []);
  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "78vh", background: "#202020", color: "#F4F1EC", display: "flex", flexDirection: "column" }}>
      <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "66%" }}><path d={floor} fill="none" stroke="#B9986A" strokeOpacity=".22" /></svg>
      <main style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px 80px" }}>
        <div className="g404" aria-hidden="true">4<i>0</i>4</div>
        <div style={{ position: "relative", margin: "-24px 0 12px" }}>
          <svg className="sw404" width="200" height="130" viewBox="0 0 180 150" role="img" aria-label="Glitch, a robot face made of dropped frames"><rect x="20" y="20" width="140" height="100" rx="26" fill="none" stroke="#F4F1EC" strokeWidth="3" strokeDasharray="18 6 4 6" /><rect x="52" y="52" width="22" height="30" rx="4" fill="#F4F1EC" /><rect x="106" y="56" width="22" height="22" fill="#B56654" /><path d="M8 66H40M140 86H176M60 100H120" stroke="#F4F1EC" strokeOpacity=".6" strokeWidth="2" /></svg>
        </div>
        <h1 className="serif" style={{ margin: "8px 0 12px", font: "200 clamp(36px, 4.6vw, 64px)/1 var(--serif)", letterSpacing: "-.035em" }}>Glitch ate <i>this page</i></h1>
        <p style={{ margin: "0 0 32px", color: "rgba(244,241,236,.7)", maxWidth: "44ch" }}>Gripp is picking the pieces back up. In the meantime, try something that still exists.</p>
        <div className="row" style={{ justifyContent: "center", gap: 12 }}>
          <Link href="/" className="btn paperbtn" style={{ minHeight: 52, padding: "0 28px" }}>Back home</Link>
          <Link href="/games" className="btn alt" style={{ minHeight: 52, padding: "0 28px", color: "#F4F1EC", borderColor: "rgba(244,241,236,.5)" }}>Open the library</Link>
        </div>
        <p className="label" style={{ marginTop: 36, color: "rgba(244,241,236,.55)" }}>&ldquo;p...ick. m...e.&rdquo;</p>
      </main>
    </div>
  );
}
