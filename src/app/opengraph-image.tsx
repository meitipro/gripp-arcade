import { ImageResponse } from "next/og";
export const alt = "Gripp Arcade";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#202020", color: "#F4F1EC" }}>
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#B9986A" }}>COMMUNITY-BUILT · UNOFFICIAL</div>
        <div style={{ fontSize: 120, marginTop: 20, fontWeight: 700 }}>Gripp Arcade</div>
        <div style={{ fontSize: 40, marginTop: 16, color: "#DFD8D0" }}>Twenty small games. One operator card.</div>
        <div style={{ display: "flex", marginTop: 48, width: 400, height: 10, background: "#B56654", borderRadius: 5 }} />
      </div>
    ),
    size,
  );
}
