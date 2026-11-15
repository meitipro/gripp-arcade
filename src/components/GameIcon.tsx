const INK = "#202020", PAPER = "#F4F1EC", BRONZE = "#B56654", GOLD = "#B9986A", BROWN = "#7A6B5A", CREAM = "#DFD8D0";

/** One small drawn icon per game, in the PrismaX palette. Pure SVG, no assets. */
const ART: Record<string, React.ReactNode> = {
  "pick-place": <><rect x="6" y="38" width="52" height="8" rx="4" fill={BROWN} /><rect x="14" y="20" width="14" height="14" fill={BRONZE} /><circle cx="44" cy="27" r="8" fill={GOLD} /><path d="M8 54h48" stroke={INK} strokeWidth="3" strokeDasharray="4 5" /></>,
  "lag-lab": <><circle cx="32" cy="32" r="20" fill="none" stroke={BRONZE} strokeWidth="4" /><circle cx="32" cy="32" r="9" fill="none" stroke={BRONZE} strokeWidth="2" strokeDasharray="3 3" /><circle cx="42" cy="40" r="5" fill={GOLD} /></>,
  "claw-club": <><line x1="32" y1="4" x2="32" y2="26" stroke={BROWN} strokeWidth="3" /><path d="M20 38 L32 26 L44 38" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="22" cy="52" r="8" fill={CREAM} stroke={INK} strokeWidth="2" /><circle cx="42" cy="52" r="8" fill={GOLD} /></>,
  "prism-bender": <><path d="M4 32h20L40 14M24 32l16 18" stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" /><path d="M22 24l16 16" stroke={INK} strokeWidth="5" strokeLinecap="round" /><circle cx="52" cy="12" r="6" fill="none" stroke={BRONZE} strokeWidth="3" /></>,
  "servo": <>{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={6 + i * 11} y="22" width="9" height="20" rx="2" fill={i === 1 ? GOLD : i === 3 ? "#5f7f5a" : CREAM} stroke={INK} strokeWidth="1.5" />)}</>,
  "tabletop-tower": <><rect x="14" y="46" width="36" height="9" fill={BRONZE} /><rect x="18" y="35" width="30" height="9" fill={GOLD} /><rect x="22" y="24" width="24" height="9" fill={BRONZE} /><rect x="14" y="10" width="22" height="9" fill={INK} /></>,
  "calibrate": <><path d="M8 46 A24 24 0 0 1 56 46" fill="none" stroke={CREAM} strokeWidth="6" /><path d="M30 24 A24 24 0 0 1 42 29" fill="none" stroke={BRONZE} strokeWidth="6" /><line x1="32" y1="46" x2="42" y2="26" stroke={INK} strokeWidth="3" strokeLinecap="round" /><circle cx="32" cy="46" r="4" fill={GOLD} /></>,
  "intent-check": <><rect x="8" y="14" width="48" height="34" rx="6" fill={INK} /><circle cx="16" cy="22" r="3" fill={BRONZE} /><path d="M22 34l7 7 14-15" stroke={PAPER} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
  "route-planner": <><rect x="6" y="6" width="52" height="52" rx="6" fill="none" stroke={CREAM} strokeWidth="2" /><path d="M14 50V34h16V18h20" stroke={BRONZE} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="14" cy="50" r="4" fill={INK} /><circle cx="50" cy="18" r="5" fill={GOLD} /></>,
  "replay": <>{[[8, 8], [36, 8], [8, 36], [36, 36]].map(([x, y], i) => <rect key={i} x={x} y={y} width="20" height="20" rx="5" fill={i === 2 ? GOLD : CREAM} stroke={INK} strokeWidth="2" />)}</>,
  "rail-dash": <><line x1="4" y1="12" x2="60" y2="12" stroke={BROWN} strokeWidth="5" /><path d="M44 12v16q0 8 8 8" stroke={BRONZE} strokeWidth="4" fill="none" /><rect x="10" y="34" width="12" height="20" rx="4" fill={INK} /><text x="38" y="52" fontSize="18" fill={GOLD}>⚙</text></>,
  "prism-pop": <>{[[8, 8, BRONZE], [34, 8, BRONZE], [8, 34, GOLD], [34, 34, BRONZE]].map(([x, y, c], i) => <circle key={i} cx={Number(x) + 11} cy={Number(y) + 11} r="11" fill={String(c)} />)}</>,
  "command-line": <><rect x="6" y="10" width="52" height="44" rx="6" fill={INK} /><path d="M14 24l8 7-8 7" stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /><line x1="28" y1="40" x2="46" y2="40" stroke={PAPER} strokeWidth="4" strokeLinecap="round" /></>,
  "whitepaper-duel": <><rect x="10" y="8" width="34" height="46" rx="4" fill={CREAM} stroke={INK} strokeWidth="2" /><line x1="16" y1="20" x2="38" y2="20" stroke={INK} strokeWidth="3" /><line x1="16" y1="30" x2="38" y2="30" stroke={BROWN} strokeWidth="3" /><circle cx="48" cy="44" r="10" fill={BRONZE} /><text x="48" y="49" textAnchor="middle" fontSize="14" fill={PAPER} fontWeight="700">?</text></>,
  "blind-operator": <><rect x="8" y="8" width="48" height="48" rx="6" fill={INK} /><circle cx="26" cy="38" r="16" fill={BROWN} opacity=".6" /><circle cx="26" cy="38" r="5" fill={BRONZE} /><rect x="46" y="12" width="6" height="6" fill={GOLD} /></>,
  "pixel-wall": <>{Array.from({ length: 16 }, (_, i) => <rect key={i} x={8 + (i % 4) * 12} y={8 + Math.floor(i / 4) * 12} width="11" height="11" fill={[BRONZE, GOLD, CREAM, BROWN][(i * 7 + Math.floor(i / 3)) % 4]} />)}</>,
  "region-rally": <><line x1="6" y1="32" x2="58" y2="32" stroke={BROWN} strokeWidth="5" /><circle cx="22" cy="32" r="10" fill={BRONZE} /><circle cx="46" cy="32" r="10" fill={INK} /><line x1="32" y1="20" x2="32" y2="44" stroke={GOLD} strokeWidth="3" /></>,
  "guess-amplifier": <><rect x="10" y="10" width="44" height="44" rx="12" fill={CREAM} /><circle cx="25" cy="30" r="4" fill={INK} /><circle cx="39" cy="30" r="4" fill={INK} /><text x="32" y="50" textAnchor="middle" fontSize="16" fill={BRONZE} fontWeight="700">?</text></>,
  "caption-bench": <><rect x="8" y="12" width="48" height="30" rx="8" fill={CREAM} stroke={INK} strokeWidth="2" /><path d="M20 42v10l10-10" fill={CREAM} stroke={INK} strokeWidth="2" /><line x1="16" y1="24" x2="48" y2="24" stroke={BRONZE} strokeWidth="3" /><line x1="16" y1="32" x2="38" y2="32" stroke={BROWN} strokeWidth="3" /></>,
  "fleet-idle": <>{[[8, 34], [28, 20], [44, 40]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width="14" height="14" rx="4" fill={i === 1 ? GOLD : BRONZE} /><circle cx={Number(x) + 7} cy={Number(y) + 7} r="2.5" fill={INK} /></g>)}<path d="M6 54h52" stroke={BROWN} strokeWidth="4" /></>,
};

export function GameIcon({ id, size = 48 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flex: "none", borderRadius: size * 0.22, background: "var(--cream)" }}>{ART[id]}</svg>
  );
}
