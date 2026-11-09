// Diagnose reported bugs against the app's own published catalog.json.
import { readFileSync } from 'node:fs';
import { matchOffer } from '../src/match.js';
const { items } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const row = (i) => `- [${i.store}/${i.kind}] ${i.title} · ${i.price} kr · ${i.amount ?? '?'} ${i.unit ?? ''}`;
const by = {};
for (const i of items) { const k = `${i.store}/${i.kind}`; by[k] = (by[k] ?? 0) + 1; }
console.log('## Antal pr. butik/kilde\n' + Object.entries(by).map(([k, n]) => `- ${k}: ${n}`).join('\n'));
const units = {};
for (const i of items) units[i.unit ?? 'ingen'] = (units[i.unit ?? 'ingen'] ?? 0) + 1;
console.log('\n## Enheder\n' + JSON.stringify(units));
for (const q of ['drue', 'letmælk', 'minimælk', 'sødmælk', 'iceberg', 'salat']) {
  const hits = items.filter((i) => i.title.toLowerCase().includes(q));
  console.log(`\n## "${q}": ${hits.length}\n` + hits.slice(0, 25).map(row).join('\n'));
}
for (const id of ['maelk', 'salat', 'agurk', 'kartofler', 'gulerod']) {
  const hits = [];
  for (const i of items) {
    const offer = { heading: i.title, description: '', price: i.price, quantity: i.amount ? { unit: i.unit, amount: i.amount } : null };
    for (const m of matchOffer(offer, { shelf: i.kind === 'hylde' })) if (m.ingredientId === id) hits.push({ i, m });
  }
  console.log(`\n## match ${id}: ${hits.length}\n` + hits.slice(0, 25).map(({ i, m }) => `${row(i)} → ${`${m.amount}${m.assumed ? " (antaget)" : ""}`}`).join('\n'));
}
