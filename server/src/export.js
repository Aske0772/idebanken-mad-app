// CLI: npm run export -- <dir> – scrape this week and write a static copy of the API
// (week.json + images) into <dir>, for hosting without a server (GitHub Pages).
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openDb } from './db.js';
import { refreshWeek, weekPayload, IMAGE_DIR } from './week.js';

const out = resolve(process.argv[2] ?? 'static');
const db = openDb();
console.log('Henter tilbudsaviser …');
const week = await refreshWeek(db);
const payload = weekPayload(db, week);

// Image paths become relative so the copy works under any base path.
for (const r of payload.recipes) {
  if (r.image?.startsWith('/images/')) r.image = r.image.slice(1);
}

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'week.json'), JSON.stringify({ ...payload, refreshing: false }));
cpSync(IMAGE_DIR, join(out, 'images'), { recursive: true });
console.log(`Færdig: ${week} skrevet til ${out}`);
