import crypto from "node:crypto";

const SECRET = process.env.RUN_SECRET || "gripp-arcade-dev-secret-change-me";
const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
export const sign = (payload: object) => {
  const body = b64(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
};
export function verify<T = any>(token: string): T | null {
  const [body, sig] = (token || "").split(".");
  if (!body || !sig) return null;
  const good = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig), c = Buffer.from(good);
  if (a.length !== c.length || !crypto.timingSafeEqual(a, c)) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString()); } catch { return null; }
}

/* ---- optional Upstash REST (shared boards + single use run ids) ---- */
const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
export const hasRedis = () => !!(URL_ && TOKEN);
export async function redis(cmd: (string | number)[]): Promise<any> {
  if (!URL_ || !TOKEN) return null;
  try {
    const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(cmd), cache: "no-store" });
    const j = await r.json();
    return j.result;
  } catch { return null; }
}
/** single-use: returns true the first time. Falls back to per-instance memory. */
const seen = new Set<string>();
export async function useOnce(id: string): Promise<boolean> {
  if (hasRedis()) {
    const r = await redis(["SET", `run:${id}`, "1", "NX", "EX", 7200]);
    return r === "OK";
  }
  if (seen.has(id)) return false;
  seen.add(id);
  if (seen.size > 5000) seen.clear();
  return true;
}
