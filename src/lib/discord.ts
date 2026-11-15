import crypto from "node:crypto";

/** Discord interaction (slash command) helpers. No SDK: plain HTTP + Ed25519, so it runs as a Vercel function. */
const SPKI_ED25519_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function verifyDiscordSignature(publicKeyHex: string, signatureHex: string, timestamp: string, rawBody: string): boolean {
  try {
    const key = crypto.createPublicKey({ key: Buffer.concat([SPKI_ED25519_PREFIX, Buffer.from(publicKeyHex, "hex")]), format: "der", type: "spki" });
    return crypto.verify(null, Buffer.from(timestamp + rawBody), key, Buffer.from(signatureHex, "hex"));
  } catch { return false; }
}

export interface MemberSummary {
  handle: string; hp: number; level: number; tier: string; runs: number; streak: number; squad: string;
  badges: string[]; bests: Record<string, number>; gamesPlayed: number; wallTiles: number; bossDmg: number; updated: number;
}

/** Clamp and sanitize whatever the browser sends. The bot never shows unchecked text. */
export function cleanSummary(x: any): MemberSummary | null {
  if (!x || typeof x !== "object") return null;
  const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
  const handle = String(x.handle ?? "").replace(/[^\w.\-]/g, "").slice(0, 24);
  if (handle.length < 2) return null;
  const bests: Record<string, number> = {};
  if (x.bests && typeof x.bests === "object") for (const [k, v] of Object.entries(x.bests).slice(0, 25)) if (/^[a-z\-]{3,20}$/.test(k)) bests[k] = n(v, 1e6);
  return {
    handle, hp: n(x.hp, 5e6), level: n(x.level, 99), tier: String(x.tier ?? "Cadet").replace(/[^\w ]/g, "").slice(0, 12),
    runs: n(x.runs, 1e6), streak: n(x.streak, 4000), squad: String(x.squad ?? "GL").replace(/[^A-Z]/g, "").slice(0, 3),
    badges: Array.isArray(x.badges) ? x.badges.map((b: unknown) => String(b).replace(/[^\w ]/g, "").slice(0, 20)).slice(0, 12) : [],
    bests, gamesPlayed: n(x.gamesPlayed, 20), wallTiles: n(x.wallTiles, 1e5), bossDmg: n(x.bossDmg, 1e6), updated: Date.now(),
  };
}

export const COLOR = 0xb56654;
export const reply = (data: object, ephemeral = false) => Response.json({ type: 4, data: { ...data, flags: ephemeral ? 64 : 0, allowed_mentions: { parse: [] } } });
export const NOTE = "Hub Points are a community game score, not an official PrismaX reward. Community-built, unofficial.";
