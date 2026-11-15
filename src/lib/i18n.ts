export type Locale = "en" | "fa";
const D: Record<string, { en: string; fa: string }> = {
  discord: { en: "Discord", fa: "دیسکورد" }, me: { en: "Progress", fa: "پیشرفت" }, season: { en: "Season", fa: "فصل" }, home: { en: "Home", fa: "خانه" }, games: { en: "Games", fa: "بازی‌ها" }, daily: { en: "Daily Five", fa: "پنج‌تایی روز" },
  card: { en: "Card", fa: "کارت" }, boards: { en: "Boards", fa: "جدول‌ها" }, wall: { en: "Wall", fa: "دیوار" },
  squads: { en: "Squads", fa: "تیم‌ها" }, quests: { en: "Quests", fa: "مأموریت‌ها" }, rules: { en: "Rules", fa: "قوانین" },
  settings: { en: "Settings", fa: "تنظیمات" }, play: { en: "Play ranked", fa: "بازی رسمی" }, practice: { en: "Practice", fa: "تمرین" },
  tagline: { en: "Twenty games, one operator card, a cast of small robots.", fa: "بیست بازی، یک کارت اپراتور و گروهی ربات کوچک." },
  hpnote: { en: "Hub Points are a community game score, not an official PrismaX reward.", fa: "امتیاز هاب یک امتیاز بازی جامعه است، نه پاداش رسمی PrismaX." },
  unofficial: { en: "Community-built. Not an official PrismaX product.", fa: "ساخته‌شده توسط جامعه. محصول رسمی PrismaX نیست." },
  heroTitle: { en: "Play like an operator", fa: "مثل یه اپراتور بازی کن" }, heroKicker: { en: "The game hub for PrismaX", fa: "هاب بازی PrismaX" },
  hero1: { en: "The game hub for PrismaX.", fa: "هاب بازی برای PrismaX." },
  hero2: { en: "Twenty small games, one operator card, a cast of small robots and a community wall. Quick sessions, honest rules, no wallet, no money.", fa: "بیست بازی کوچک، یک کارت اپراتور، گروهی ربات و دیوار جامعه. جلسه‌های کوتاه، قوانین شفاف، بدون کیف پول و بدون پول." },
  playDaily: { en: "Play today's Daily Five", fa: "پنج‌تایی امروز را بازی کن" }, allGames: { en: "Browse all 20 games", fa: "هر ۲۰ بازی" },
  search: { en: "Search games", fa: "جستجوی بازی" }, results: { en: "Result", fa: "نتیجه" }, total: { en: "Total", fa: "مجموع" },
  copy: { en: "Copy result", fa: "کپی نتیجه" }, quit: { en: "Quit run", fa: "خروج" }, help: { en: "Help", fa: "راهنما" },
  mycard: { en: "My card", fa: "کارت من" }, welcome: { en: "Welcome, operator", fa: "خوش آمدی، اپراتور" },
  pause: { en: "Pause", fa: "توقف" }, resume: { en: "Resume", fa: "ادامه" }, again: { en: "Play again", fa: "بازی دوباره" },
};
export const tr = (k: string, l: Locale) => D[k]?.[l] ?? D[k]?.en ?? k;
