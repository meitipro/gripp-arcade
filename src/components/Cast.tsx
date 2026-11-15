const C = { ink: "#202020", paper: "#F4F1EC", bronze: "#B56654", gold: "#B9986A", brown: "#7A6B5A", cream: "#DFD8D0" };

export function Character({ name, size = 96 }: { name: "Gripp" | "Moss" | "Lumen" | "Dot" | "Glitch"; size?: number }) {
  const s = size;
  const body = (children: React.ReactNode) => (
    <svg width={s} height={s} viewBox="0 0 100 100" role="img" aria-label={`${name}, host character`} style={{ overflow: "visible" }}>{children}</svg>
  );
  switch (name) {
    case "Gripp": return body(<>
      <rect x="14" y="84" width="72" height="8" rx="4" fill={C.ink} />
      <rect x="46" y="44" width="8" height="42" fill={C.brown} />
      <g style={{ transformOrigin: "50px 44px", animation: "wave 2.4s ease-in-out infinite" }}>
        <circle cx="50" cy="40" r="12" fill={C.bronze} /><circle cx="46" cy="38" r="2.5" fill={C.paper} /><circle cx="55" cy="38" r="2.5" fill={C.paper} />
        <path d="M50 30 L28 12 M50 30 L72 12" stroke={C.gold} strokeWidth="7" strokeLinecap="round" fill="none" />
      </g></>);
    case "Moss": return body(<>
      <rect x="22" y="30" width="56" height="52" rx="16" fill={C.brown} /><circle cx="38" cy="54" r="8" fill={C.paper} /><circle cx="62" cy="54" r="8" fill={C.paper} />
      <circle cx="38" cy="54" r="3.5" fill={C.ink} /><circle cx="62" cy="54" r="3.5" fill={C.ink} /><rect x="40" y="68" width="20" height="4" rx="2" fill={C.ink} />
      <rect x="46" y="16" width="8" height="16" fill={C.gold} /><circle cx="50" cy="14" r="6" fill={C.bronze} /></>);
    case "Lumen": return body(<>
      <path d="M50 12 L82 44 L50 88 L18 44 Z" fill={C.gold} /><path d="M50 12 L50 88 M18 44 L82 44" stroke={C.paper} strokeWidth="2" opacity=".6" />
      <circle cx="42" cy="46" r="4" fill={C.ink} /><circle cx="58" cy="46" r="4" fill={C.ink} /><path d="M44 58 Q50 64 56 58" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" /></>);
    case "Dot": return body(<>
      <circle cx="50" cy="52" r="34" fill={C.ink} /><circle cx="50" cy="52" r="26" fill="none" stroke={C.gold} strokeWidth="3" strokeDasharray="4 6" style={{ transformOrigin: "50px 52px", animation: "spin 12s linear infinite" }} />
      <circle cx="40" cy="48" r="4" fill={C.paper} /><circle cx="60" cy="48" r="4" fill={C.paper} /><rect x="42" y="62" width="16" height="3" rx="1.5" fill={C.bronze} /></>);
    case "Glitch": return body(<>
      <rect x="20" y="26" width="60" height="56" fill={C.ink} /><rect x="14" y="40" width="22" height="10" fill={C.bronze} /><rect x="64" y="56" width="22" height="8" fill={C.gold} />
      <rect x="34" y="44" width="10" height="10" fill={C.paper} /><rect x="58" y="44" width="10" height="10" fill={C.paper} /><rect x="38" y="68" width="26" height="4" fill={C.bronze} />
      <rect x="20" y="86" width="60" height="3" fill={C.bronze} opacity=".6" /></>);
  }
}

export const CAST = [
  { name: "Gripp", role: "Founder host", line: "A gripper who loves being useful." },
  { name: "Moss", role: "Teacher", line: "Calm, precise and a little dry." },
  { name: "Lumen", role: "Lens", line: "Explains light, vision and why it bends." },
  { name: "Dot", role: "Herald", line: "Posts the recaps and keeps the calendar." },
  { name: "Glitch", role: "Boss", line: "Not evil. Just very, very buggy." },
] as const;
