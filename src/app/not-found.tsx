import Link from "next/link";
import { Character } from "@/components/Cast";
export default function NotFound() {
  return (
    <div className="wrap"><section className="block" style={{ textAlign: "center" }}>
      <div style={{ display: "grid", placeItems: "center" }}><Character name="Glitch" size={140} /></div>
      <h1>404, Glitch ate this page</h1>
      <p className="muted">That page does not exist (or it was never built). Nothing was lost.</p>
      <Link className="btn" href="/">Back to the hub</Link>
    </section></div>
  );
}
