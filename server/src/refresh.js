// CLI: npm run refresh – scrape all tilbudsaviser and rebuild this week's dishes.
import { openDb } from './db.js';
import { refreshWeek } from './week.js';

const db = openDb();
console.log('Henter tilbudsaviser …');
const week = await refreshWeek(db);
console.log(`Færdig: ${week}`);
