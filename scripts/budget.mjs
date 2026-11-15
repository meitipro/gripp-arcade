// Performance budget (plan chapter 9): first-load JS per page under 120 KB gzipped, any single chunk under 150 KB gzipped.
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
const m = JSON.parse(readFileSync(".next/app-build-manifest.json", "utf8"));
const cache = new Map();
const gz = (f) => { if (!cache.has(f)) cache.set(f, existsSync(".next/" + f) ? gzipSync(readFileSync(".next/" + f)).length : 0); return cache.get(f); };
let worst = { page: "", kb: 0 }, bad = false;
for (const [page, files] of Object.entries(m.pages)) {
  const js = [...new Set(files.filter((f) => f.endsWith(".js")))];
  const kb = js.reduce((a, f) => a + gz(f), 0) / 1024;
  if (kb > worst.kb) worst = { page, kb };
  for (const f of js) if (gz(f) > 150 * 1024) { console.error(`chunk over 150 KB gzip: ${f}`); bad = true; }
}
console.log(`largest first-load JS: ${worst.page} at ${worst.kb.toFixed(1)} KB gzip (budget 120)`);
if (worst.kb > 120) { console.error("First load JS over budget"); bad = true; }
process.exit(bad ? 1 : 0);
