"use client";
import { Character } from "@/components/Cast";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap"><section className="block" style={{ textAlign: "center" }}>
      <div style={{ display: "grid", placeItems: "center" }}><Character name="Moss" size={120} /></div>
      <h1>Something jammed</h1>
      <p className="muted">Your progress is safe on this device. Try again, and if it keeps happening, reload the page.</p>
      <button className="btn" onClick={reset}>Try again</button>
    </section></div>
  );
}
