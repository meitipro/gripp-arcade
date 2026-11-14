import { DEFAULT_HP } from "./points";

export type Category = "Skill" | "Puzzle" | "Brain" | "Wild" | "Social";
export type Stat = "Precision" | "Speed" | "Brain" | "Community";
export interface GameMeta {
  id: string; n: number; name: string; tagline: string; category: Category;
  mode: string; minutes: number; host: string; stats: Stat[];
  rules: string[]; formula: string; thresholds: number[]; hp: readonly number[];
  par: number;        // score that counts as "excellent" for stat scaling
  maxScore: number;   // server range check
  minMs: number;      // fastest plausible run
  verify: "Replay" | "Range check" | "Server authority";
  wave: 1 | 2 | 3; daily: boolean; unit?: string;
}
type In = Omit<GameMeta, "hp" | "daily"> & { hp?: readonly number[]; daily?: boolean };
const g = (m: In): GameMeta => ({ hp: DEFAULT_HP, daily: true, ...m });

export const GAMES: GameMeta[] = [
  g({ id: "pick-place", n: 1, name: "Pick & Place", tagline: "Sort the belt before the clock runs out.", category: "Skill", mode: "Solo", minutes: 3, host: "Gripp", stats: ["Precision", "Speed"], wave: 1,
    rules: ["A run lasts 60 seconds.", "Three shapes: square, circle, triangle, each with a bin.", "A correct drop scores 10 x combo (up to x8).", "A wrong drop is -5 and resets the combo.", "A dropped item resets the combo.", "The belt gains 8% speed every 15 seconds."],
    formula: "Sum of 10 x combo per correct drop, minus 5 per wrong drop.", thresholds: [400, 800, 1200, 1600], par: 1600, maxScore: 4000, minMs: 40000, verify: "Replay" }),
  g({ id: "lag-lab", n: 2, name: "Lag Lab", tagline: "Aim at a target that answers late.", category: "Skill", mode: "Solo", minutes: 2, host: "Moss", stats: ["Speed"], wave: 2,
    rules: ["Ten rounds.", "Round one has 40 ms of delay, each round adds 25 ms.", "Hit the ring: score by distance to the center.", "A faster confirm gives up to 50 bonus.", "Round ten adds jitter."],
    formula: "Round = 60 x accuracy + time bonus (0-50). Max 1,000.", thresholds: [300, 550, 750, 900], par: 900, maxScore: 1100, minMs: 8000, verify: "Range check" }),
  g({ id: "claw-club", n: 3, name: "Claw Club", tagline: "Grab capsules that hold your friends' faces.", category: "Wild", mode: "Solo", minutes: 2, host: "Gripp", stats: ["Precision", "Community"], wave: 3,
    rules: ["Eight claw drops per run.", "Grip weakens every two drops.", "A delivered capsule scores 100, +50 if caught on the first try.", "Gold capsules score double."],
    formula: "100 per capsule + 50 first try, gold doubles.", thresholds: [200, 400, 600, 800], par: 800, maxScore: 1600, minMs: 8000, verify: "Range check" }),
  g({ id: "prism-bender", n: 4, name: "Prism Bender", tagline: "Bend a beam through mirrors to reach every target.", category: "Puzzle", mode: "Solo", minutes: 2, host: "Lumen", stats: ["Brain"], wave: 2,
    rules: ["Three boards from the seed.", "Tap mirrors to rotate them until every target is lit.", "Fewer moves earn more.", "A hint costs 50 points."],
    formula: "Board = 300 + 40 x (par - moves), min 100, minus 50 per hint.", thresholds: [300, 600, 800, 1000], par: 1000, maxScore: 1800, minMs: 5000, verify: "Replay" }),
  g({ id: "servo", n: 5, name: "Servo", tagline: "A daily word puzzle in the language of robots.", category: "Puzzle", mode: "Solo", minutes: 4, host: "Moss", stats: ["Brain"], wave: 1,
    rules: ["One shared word per day (UTC).", "Six guesses of five letters.", "Green = right place, gold = wrong place, grey = absent.", "Only dictionary words count.", "One ranked run per day, unlimited practice."],
    formula: "1,000 - 150 per extra guess, plus time bonus up to 100.", thresholds: [250, 400, 550, 800], hp: [10, 25, 35, 50, 60], par: 850, maxScore: 1100, minMs: 2000, verify: "Server authority" }),
  g({ id: "tabletop-tower", n: 6, name: "Tabletop Tower", tagline: "Stack blocks as high as the table can bear.", category: "Skill", mode: "Solo", minutes: 3, host: "Gripp", stats: ["Precision"], wave: 2,
    rules: ["Blocks start 200 px wide.", "Within 4 px is perfect and keeps full width.", "Perfect streaks restore 10 px.", "Overhang is trimmed.", "The run ends on a full miss."],
    formula: "Floors + 2 x perfect streak bonus.", thresholds: [20, 40, 60, 80], par: 60, maxScore: 700, minMs: 3000, verify: "Range check" }),
  g({ id: "calibrate", n: 7, name: "Calibrate", tagline: "Stop the needle exactly on target.", category: "Skill", mode: "Solo", minutes: 1, host: "Moss", stats: ["Precision"], wave: 1,
    rules: ["Twelve rounds.", "The target shrinks every round.", "Needle speed rises every three rounds.", "Only accuracy counts, not speed."],
    formula: "Round = 100 x (1 - distance / half width), min 0.", thresholds: [600, 850, 1050, 1150], par: 1050, maxScore: 1200, minMs: 8000, verify: "Range check" }),
  g({ id: "intent-check", n: 8, name: "Intent Check", tagline: "Was the task really done? Accept or reject the demo.", category: "Brain", mode: "Solo", minutes: 2, host: "Lumen", stats: ["Brain", "Community"], wave: 3,
    rules: ["Ten demos per run.", "Correct call 100, borderline 60 either way.", "Fast calls add up to 20.", "Three correct in a row adds 25."],
    formula: "100 (60 borderline) + time bonus 20 + 25 per three streak.", thresholds: [400, 600, 800, 950], par: 950, maxScore: 1500, minMs: 8000, verify: "Replay" }),
  g({ id: "route-planner", n: 9, name: "Route Planner", tagline: "Find the cheapest safe path for a robot.", category: "Puzzle", mode: "Solo", minutes: 3, host: "Moss", stats: ["Brain"], wave: 2,
    rules: ["Four boards, growing size.", "Move up, down, left, right.", "Hazards end the path. Mud costs double.", "Undo is free."],
    formula: "Board = 250 - 25 x (cost - optimal), min 25. +100 if all optimal.", thresholds: [300, 500, 750, 950], par: 1000, maxScore: 1200, minMs: 6000, verify: "Replay" }),
  g({ id: "replay", n: 10, name: "Replay", tagline: "Watch the moves, then repeat them in order.", category: "Brain", mode: "Solo", minutes: 2, host: "Dot", stats: ["Brain"], wave: 1,
    rules: ["Round one has 3 steps, each round adds one.", "A mistake ends the run.", "Speed rises every five rounds."],
    formula: "10 x length per round + 20 per five-round streak.", thresholds: [100, 200, 350, 500], par: 500, maxScore: 4000, minMs: 4000, verify: "Replay" }),
  g({ id: "rail-dash", n: 11, name: "Rail Dash", tagline: "Run the ceiling rail. Tap to jump, hold to duck.", category: "Skill", mode: "Solo", minutes: 2, host: "Glitch", stats: ["Speed"], wave: 3,
    rules: ["Three hearts or 90 seconds.", "Jump gaps, duck hooks.", "Bolts score 10, distance scores 1 per meter.", "Speed rises every 20 seconds."],
    formula: "Distance + 10 per bolt.", thresholds: [800, 1400, 2000, 2600], par: 2600, maxScore: 9000, minMs: 6000, verify: "Range check" }),
  g({ id: "prism-pop", n: 12, name: "Prism Pop", tagline: "Pop groups of matching shapes. Chain for more.", category: "Puzzle", mode: "Solo", minutes: 2, host: "Lumen", stats: ["Speed", "Brain"], wave: 2,
    rules: ["8 x 8 board.", "Tap a group of 3 or more matching shapes.", "Group score = 2 x size squared, chains multiply.", "60 seconds, or no groups left."],
    formula: "2 x size^2 x chain.", thresholds: [2000, 4500, 7500, 10000], par: 10000, maxScore: 60000, minMs: 4000, verify: "Replay" }),
  g({ id: "command-line", n: 13, name: "Command Line", tagline: "Type robot commands exactly. Fast and clean.", category: "Brain", mode: "Solo", minutes: 2, host: "Moss", stats: ["Brain", "Speed"], wave: 1,
    rules: ["45 seconds.", "Type each command exactly, then press Enter.", "Correct characters score 1.", "Accuracy under 80% halves the bonus.", "Wrong characters count as errors."],
    formula: "Correct chars x accuracy multiplier (0.5-1.5) + 5 per command.", thresholds: [150, 250, 350, 450], par: 450, maxScore: 2500, minMs: 30000, verify: "Replay" }),
  g({ id: "whitepaper-duel", n: 14, name: "Whitepaper Duel", tagline: "A quiz duel against a bot. Faster answers earn more.", category: "Brain", mode: "Duel", minutes: 4, host: "Moss", stats: ["Brain", "Community"], wave: 3,
    rules: ["Eight questions, 15 seconds each.", "Correct = 100 + up to 50 for speed.", "Wrong = 0.", "Beat the bot to win."],
    formula: "100 + speed bonus per correct answer.", thresholds: [300, 500, 700, 950], par: 1000, maxScore: 1300, minMs: 6000, verify: "Server authority" }),
  g({ id: "blind-operator", n: 15, name: "Blind Operator", tagline: "Steer a robot that can only see three cells.", category: "Wild", mode: "Co-op", minutes: 4, host: "Lumen", stats: ["Brain", "Community"], wave: 3,
    rules: ["Up to 90 seconds.", "You are the Operator with a view radius of 3.", "A scripted Guide gives you 12 pings.", "Hazards end the mission.", "Success = 500 + time + ping bonuses."],
    formula: "500 + time left x 3 + unused pings x 20.", thresholds: [300, 600, 900, 1100], par: 1100, maxScore: 1500, minMs: 4000, verify: "Server authority" }),
  g({ id: "pixel-wall", n: 16, name: "Pixel Wall", tagline: "One shared canvas. One pixel at a time.", category: "Social", mode: "Community", minutes: 1, host: "Dot", stats: ["Community"], wave: 3,
    rules: ["Canvas is 48 x 30.", "One pixel every 10 seconds in this build.", "12 colors.", "Quality of art is never scored."],
    formula: "Pixels placed this visit.", thresholds: [5, 15, 30, 50], par: 50, maxScore: 400, minMs: 1000, verify: "Server authority", unit: "pixels", daily: false }),
  g({ id: "region-rally", n: 17, name: "Region Rally", tagline: "Tap fast, tap together. Squad tug of war.", category: "Social", mode: "Community", minutes: 2, host: "Dot", stats: ["Community", "Speed"], wave: 3,
    rules: ["30 second rounds here.", "Taps beyond 8 per second are ignored.", "Your squad needs a 10% lead to win.", "Rival squad is simulated."],
    formula: "Your capped taps.", thresholds: [60, 100, 140, 190], par: 190, maxScore: 260, minMs: 25000, verify: "Server authority", unit: "taps" }),
  g({ id: "guess-amplifier", n: 18, name: "Guess the Amplifier", tagline: "Pick the real owner of the card from clues.", category: "Social", mode: "Solo", minutes: 3, host: "Dot", stats: ["Community"], wave: 3,
    rules: ["Ten rounds.", "A clue appears every 6 seconds.", "100 minus 20 per extra clue.", "Only sample, opted-in members appear."],
    formula: "100 - 20 per clue shown.", thresholds: [400, 500, 650, 800], par: 800, maxScore: 1000, minMs: 6000, verify: "Server authority" }),
  g({ id: "caption-bench", n: 19, name: "Caption Bench", tagline: "Caption the image. Vote for the funniest.", category: "Social", mode: "Community", minutes: 2, host: "Dot", stats: ["Community"], wave: 3,
    rules: ["One caption per scene, max 80 characters.", "Vote on up to 10 captions.", "You cannot vote for yourself."],
    formula: "10 for submitting + 3 per vote cast.", thresholds: [10, 30, 60, 100], par: 100, maxScore: 500, minMs: 4000, verify: "Server authority", unit: "points" }),
  g({ id: "fleet-idle", n: 20, name: "Fleet Idle", tagline: "A tiny fleet that earns scrap while you are away.", category: "Wild", mode: "Solo", minutes: 1, host: "Glitch", stats: ["Community"], wave: 3,
    rules: ["The fleet earns scrap every second, up to 8 hours offline.", "Upgrades have diminishing returns.", "Collect to bank scrap.", "Nothing can be bought with money."],
    formula: "Scrap collected this visit.", thresholds: [200, 500, 1000, 2000], par: 2000, maxScore: 400000, minMs: 1000, verify: "Server authority", unit: "scrap", daily: false }),
];
export const gameById = (id: string) => GAMES.find((x) => x.id === id);
export const CATEGORIES: Category[] = ["Skill", "Puzzle", "Brain", "Wild", "Social"];

export const SQUADS = [
  { code: "IR", name: "Iran", lang: "Persian", members: 412 }, { code: "GL", name: "Global", lang: "English", members: 1204 },
  { code: "TR", name: "Turkey", lang: "Turkish", members: 240 }, { code: "IN", name: "India", lang: "English, Hindi", members: 530 },
  { code: "NG", name: "Nigeria", lang: "English", members: 96 }, { code: "ID", name: "Indonesia", lang: "Indonesian", members: 142 },
  { code: "PH", name: "Philippines", lang: "English, Filipino", members: 104 }, { code: "RU", name: "Russia", lang: "Russian", members: 86 },
  { code: "AR", name: "Arabic", lang: "Arabic", members: 74 }, { code: "BR", name: "Brazil", lang: "Portuguese", members: 188 },
  { code: "VN", name: "Vietnam", lang: "Vietnamese", members: 118 }, { code: "EU", name: "Europe", lang: "Several", members: 160 },
];

export interface Quest { id: string; name: string; cycle: "Daily" | "Weekly" | "Season"; goal: string; hp: number; level: string }
export const QUESTS: Quest[] = [
  { id: "warm", name: "Warm up", cycle: "Daily", goal: "Finish any 2 ranked runs", hp: 20, level: "Easy" },
  { id: "new", name: "Try something new", cycle: "Daily", goal: "Play 3 different games today", hp: 30, level: "Easy" },
  { id: "perfect", name: "Perfect drop", cycle: "Daily", goal: "Score 800 in Pick & Place", hp: 30, level: "Medium" },
  { id: "fingers", name: "Quick fingers", cycle: "Daily", goal: "Score 250 in Command Line", hp: 30, level: "Medium" },
  { id: "rhythm", name: "Five day rhythm", cycle: "Weekly", goal: "Complete 3 or more runs on 5 days", hp: 150, level: "Medium" },
  { id: "bests", name: "Three bests", cycle: "Weekly", goal: "Set 3 personal bests", hp: 120, level: "Medium" },
  { id: "share", name: "Show and tell", cycle: "Weekly", goal: "Download or copy your card once", hp: 60, level: "Easy" },
  { id: "wall", name: "Wall tour", cycle: "Weekly", goal: "Visit 10 mini cards", hp: 40, level: "Easy" },
  { id: "spec", name: "Reach Specialist", cycle: "Season", goal: "Hit 2,500 HP", hp: 300, level: "Hard" },
  { id: "pixel", name: "Pixel painter", cycle: "Season", goal: "Place 100 Pixel Wall tiles", hp: 150, level: "Medium" },
];

export const BADGES = [
  { id: "first", name: "First Run", desc: "Finish a ranked run" },
  { id: "daily5", name: "Perfect Five", desc: "Finish a Daily Five" },
  { id: "steady", name: "Steady", desc: "3 day streak" },
  { id: "week", name: "Perfect Seven", desc: "7 day streak" },
  { id: "all", name: "Explorer", desc: "Play 10 different games" },
  { id: "pb", name: "Personal Best", desc: "Beat your best by 3%" },
  { id: "spec", name: "Specialist", desc: "Reach tier III" },
];
