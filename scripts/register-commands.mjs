// One-time (and after changes): register the slash commands with Discord.
// Usage: DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... node scripts/register-commands.mjs [GUILD_ID]
const app = process.env.DISCORD_APP_ID, token = process.env.DISCORD_BOT_TOKEN, guild = process.argv[2];
if (!app || !token) { console.error("Set DISCORD_APP_ID and DISCORD_BOT_TOKEN"); process.exit(1); }
const commands = [
  { name: "about", description: "What is Gripp Arcade?" },
  { name: "daily", description: "Today's Daily Five games" },
  { name: "link", description: "Link your hub account so /stats can show your progress" },
  { name: "stats", description: "Show a member's hub stats", options: [{ type: 6, name: "member", description: "Who to look up (default: you)", required: false }] },
  { name: "leaderboard", description: "Top operators by Hub Points" },
];
const url = guild ? `https://discord.com/api/v10/applications/${app}/guilds/${guild}/commands` : `https://discord.com/api/v10/applications/${app}/commands`;
const r = await fetch(url, { method: "PUT", headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(commands) });
console.log(r.status, r.ok ? "registered " + commands.length + " commands" : await r.text());
