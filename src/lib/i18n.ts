export type Locale = "en" | "fa";
const D: Record<string, { en: string; fa: string }> = {
  home: { en: "Home", fa: "خانه" }, games: { en: "Games", fa: "بازی‌ها" }, daily: { en: "Daily Five", fa: "پنج‌تایی روز" },
  card: { en: "Card", fa: "کارت" }, boards: { en: "Boards", fa: "جدول‌ها" }, wall: { en: "Wall", fa: "دیوار" },
  squads: { en: "Squads", fa: "تیم‌ها" }, quests: { en: "Quests", fa: "مأموریت‌ها" }, rules: { en: "Rules", fa: "قوانین" },
  settings: { en: "Settings", fa: "تنظیمات" }, play: { en: "Play ranked", fa: "بازی رسمی" }, practice: { en: "Practice", fa: "تمرین" },
  tagline: { en: "Twenty games, one operator card, a cast of small robots.", fa: "بیست بازی، یک کارت اپراتور و گروهی ربات کوچک." },
  hpnote: { en: "Hub Points are a community game score, not an official PrismaX reward.", fa: "امتیاز هاب یک امتیاز بازی جامعه است، نه پاداش رسمی PrismaX." },
  unofficial: { en: "Community-built. Not an official PrismaX product.", fa: "ساخته‌شده توسط جامعه. محصول رسمی PrismaX نیست." },
  pause: { en: "Pause", fa: "توقف" }, resume: { en: "Resume", fa: "ادامه" }, again: { en: "Play again", fa: "بازی دوباره" },
};
export const tr = (k: string, l: Locale) => D[k]?.[l] ?? D[k]?.en ?? k;
