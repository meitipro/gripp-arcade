import { NextResponse } from "next/server";
import { ANSWERS, WORDS } from "@/lib/words";
import { hashString, utcDay } from "@/lib/rng";

export const dynamic = "force-dynamic";
const VALID = new Set([...WORDS, ...ANSWERS]);
function answerFor(day: string, practice?: number) {
  const idx = practice !== undefined ? practice % ANSWERS.length : hashString("servo:" + day) % ANSWERS.length;
  return ANSWERS[idx];
}
function evaluate(answer: string, guess: string): ("g" | "y" | "x")[] {
  const res: ("g" | "y" | "x")[] = Array(5).fill("x");
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) if (guess[i] === answer[i]) res[i] = "g"; else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  for (let i = 0; i < 5; i++) if (res[i] !== "g" && left[guess[i]] > 0) { res[i] = "y"; left[guess[i]]--; }
  return res;
}
/** The answer never leaves the server. Only per-letter results come back; the word is revealed after a loss. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const guess = String(b.guess ?? "").toLowerCase();
  const practice = Number.isInteger(b.practice) ? (b.practice as number) : undefined;
  const row = Number(b.row ?? 0);
  if (!/^[a-z]{5}$/.test(guess)) return NextResponse.json({ valid: false, error: "Five letters" });
  if (!VALID.has(guess)) return NextResponse.json({ valid: false, error: "Not in the word list" });
  const answer = answerFor(utcDay(), practice);
  const result = evaluate(answer, guess);
  const won = result.every((r) => r === "g");
  return NextResponse.json({ valid: true, result, won, answer: won || row >= 5 ? answer : undefined });
}
