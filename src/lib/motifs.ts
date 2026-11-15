/** Generated decoration: terrain contours and a perspective floor. No image files. */
export function contourPath(cx: number, cy: number, rings: number, r0: number, step: number, seed: number, sx = 1.25): string {
  let d = "";
  for (let k = 0; k < rings; k++) {
    const r = r0 + k * step;
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const rr = r * (1 + 0.09 * Math.sin(3 * a + seed + k * 0.35) + 0.05 * Math.sin(5 * a + seed * 1.7 - k * 0.2) + 0.025 * Math.sin(9 * a + k));
      d += (i ? "L" : "M") + (cx + rr * Math.cos(a) * sx).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1);
    }
    d += "Z";
  }
  return d;
}
export function floorPath(w: number, h: number, cols: number, rows: number): string {
  let d = "";
  const vx = w / 2;
  for (let i = -cols; i <= cols; i++) d += `M${vx} 0L${(vx + i * (w / cols) * 1.8).toFixed(1)} ${h}`;
  for (let j = 1; j <= rows; j++) { const t = j / rows; d += `M0 ${(h * t * t).toFixed(1)}L${w} ${(h * t * t).toFixed(1)}`; }
  return d;
}
