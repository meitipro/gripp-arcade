import { robotFace } from "./members";
import { tierFor } from "./points";

export interface CardData { handle: string; hp: number; level: number; squad: string; serial: number; since: string; stats: { Precision: number; Speed: number; Brain: number; Community: number }; badges: string[] }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export const cleanHandle = (h: string) => h.replace(/[^\w.\-]/g, "").slice(0, 24);

/** Pure function: member object in, 5:7 SVG card out. Engineer and above flip to the dark theme with gold. */
export function cardSvg(c: CardData): string {
  const t = tierFor(c.hp);
  const dark = t.n >= 4;
  const bg = dark ? "#202020" : "#F4F1EC", fg = dark ? "#F4F1EC" : "#202020", acc = dark ? "#B9986A" : "#B56654", soft = dark ? "#3a3a3a" : "#DFD8D0";
  const handle = esc(cleanHandle(c.handle) || "operator");
  let contours = "";
  for (let i = 0; i < 6; i++) contours += `<path d="M-20 ${420 + i * 38} C 120 ${360 + i * 30}, 300 ${520 + i * 20}, 520 ${430 + i * 40}" fill="none" stroke="${soft}" stroke-width="1.5"/>`;
  const bars = (["Precision", "Speed", "Brain", "Community"] as const).map((k, i) => {
    const y = 508 + i * 36;
    return `<text x="36" y="${y}" font-family="monospace" font-size="12" letter-spacing="1.5" fill="${acc}">${k.toUpperCase()}</text>
<rect x="170" y="${y - 10}" width="220" height="6" rx="3" fill="${soft}"/><rect x="170" y="${y - 10}" width="${(220 * c.stats[k]) / 100}" height="6" rx="3" fill="${acc}"/>
<text x="464" y="${y}" text-anchor="end" font-family="Georgia,serif" font-size="22" fill="${fg}">${c.stats[k]}</text>`;
  }).join("");
  const pinned = c.badges.slice(0, 3).map((b, i) => `<g transform="translate(${36 + i * 112} 650)"><rect width="104" height="26" rx="13" fill="none" stroke="${acc}"/><text x="52" y="17" text-anchor="middle" font-family="monospace" font-size="10" fill="${fg}">${esc(b.toUpperCase().slice(0, 12))}</text></g>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700" role="img" aria-label="Operator card for ${handle}, ${t.name}, ${c.hp} Hub Points">
<defs><linearGradient id="gb" x1="0" x2="1"><stop offset="0" stop-color="#B9986A"/><stop offset="1" stop-color="#B56654"/></linearGradient></defs>
<rect width="500" height="700" rx="28" fill="${bg}"/>${contours}
<rect x="3" y="3" width="494" height="694" rx="26" fill="none" stroke="${t.n === 6 ? "url(#gb)" : acc}" stroke-width="${t.n >= 4 ? 4 : 2}"/>
<text x="36" y="52" font-family="monospace" font-size="12" letter-spacing="3" fill="${acc}">GRIPP ARCADE</text>
<text x="464" y="52" text-anchor="end" font-family="monospace" font-size="12" letter-spacing="2" fill="${fg}">NO. ${String(c.serial).padStart(4, "0")}</text>
<rect x="150" y="80" width="200" height="200" rx="36" fill="${soft}"/><svg x="160" y="90" width="180" height="180" viewBox="0 0 100 100">${robotFace(handle)}</svg>
<text x="36" y="326" font-family="monospace" font-size="12" letter-spacing="3" fill="${acc}">TIER ${t.roman}</text>
<text x="36" y="372" font-family="Georgia,serif" font-size="44" fill="${fg}">${t.name}</text>
<text x="464" y="372" text-anchor="end" font-family="monospace" font-size="14" fill="${fg}">LV ${String(c.level).padStart(2, "0")}</text>
<text x="36" y="410" font-family="Georgia,serif" font-size="24" fill="${fg}">@${handle}</text>
<text x="36" y="436" font-family="monospace" font-size="11" letter-spacing="2" fill="${acc}">SQUAD ${esc(c.squad)}  ·  SINCE ${esc(c.since)}</text>
${bars}${pinned}
<text x="464" y="668" text-anchor="end" font-family="Georgia,serif" font-size="26" fill="${fg}">${c.hp.toLocaleString("en-US")}</text>
<text x="464" y="684" text-anchor="end" font-family="monospace" font-size="9" letter-spacing="2" fill="${acc}">HUB POINTS</text>
</svg>`;
}
