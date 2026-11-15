/** The hub's one authored moment: a calibration dial whose needle sweeps wide, overshoots and settles on the target. */
export function HeroDial() {
  const ticks = Array.from({ length: 41 }, (_, i) => i);
  const pt = (deg: number, r: number) => { const a = ((deg - 90) * Math.PI) / 180; return [200 + r * Math.cos(a), 210 + r * Math.sin(a)]; };
  return (
    <svg viewBox="0 0 400 270" width="100%" role="img" aria-label="A calibration dial with the needle settling on the target arc" style={{ maxWidth: 520, overflow: "visible" }}>
      <path d={`M${pt(-80, 170).join(" ")} A170 170 0 0 1 ${pt(80, 170).join(" ")}`} fill="none" stroke="var(--cream)" strokeWidth="22" strokeLinecap="round" />
      <path d={`M${pt(6, 170).join(" ")} A170 170 0 0 1 ${pt(26, 170).join(" ")}`} fill="none" stroke="var(--bronze)" strokeWidth="22" />
      {ticks.map((i) => { const d = -80 + i * 4, long = i % 5 === 0; const [x1, y1] = pt(d, long ? 128 : 136), [x2, y2] = pt(d, 146); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth={long ? 2.5 : 1.2} opacity={long ? 0.9 : 0.45} />; })}
      {[-80, -40, 0, 40, 80].map((d) => { const [x, y] = pt(d, 108); return <text key={d} x={x} y={y + 4} textAnchor="middle" fontFamily="var(--serif)" fontSize="15" fill="var(--brown)">{(d + 80) / 4 * 2.5}</text>; })}
      <g className="needle" style={{ transformOrigin: "200px 210px" }}>
        <line x1="200" y1="210" x2="200" y2="62" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="200" cy="210" r="14" fill="var(--ink)" /><circle cx="200" cy="210" r="5" fill="var(--gold)" />
      </g>
      <line x1="20" y1="250" x2="380" y2="250" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
