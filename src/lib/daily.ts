import { GAMES } from "./catalog";
import { hashString, mulberry32, shuffle, utcDay } from "./rng";
/** Daily Five: Servo plus four games drawn from the UTC date seed. */
export function dailyFive(day = utcDay()): string[] {
  const pool = GAMES.filter((g) => g.daily && g.id !== "servo").map((g) => g.id);
  const r = mulberry32(hashString("daily:" + day));
  return ["servo", ...shuffle(r, pool).slice(0, 4)];
}
