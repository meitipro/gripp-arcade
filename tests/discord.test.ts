import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { cleanSummary, verifyDiscordSignature } from "../src/lib/discord";

describe("discord", () => {
  it("verifies a real ed25519 signature and rejects a forged one", () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
    const raw = publicKey.export({ format: "der", type: "spki" }).subarray(12).toString("hex");
    const ts = "1700000000", body = JSON.stringify({ type: 1 });
    const sig = crypto.sign(null, Buffer.from(ts + body), privateKey).toString("hex");
    expect(verifyDiscordSignature(raw, sig, ts, body)).toBe(true);
    expect(verifyDiscordSignature(raw, sig, ts, body + " ")).toBe(false);
    expect(verifyDiscordSignature(raw, "00".repeat(64), ts, body)).toBe(false);
  });
  it("clamps and sanitizes summaries", () => {
    const s = cleanSummary({ handle: "mira<script>.ops", hp: 1e12, level: 500, badges: ["<b>x</b>"], bests: { "pick-place": 1e12, "BAD KEY": 5 } })!;
    expect(s.handle).toBe("mirascript.ops"); expect(s.hp).toBe(5e6); expect(s.level).toBe(99);
    expect(s.badges[0]).not.toContain("<"); expect(Object.keys(s.bests)).toEqual(["pick-place"]);
    expect(cleanSummary({ handle: "a" })).toBeNull();
  });
});
