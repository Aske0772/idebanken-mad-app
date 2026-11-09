// Which catalog products does each ingredient match? Run against the app's own
// published catalog.json (no chain is contacted) to check new search patterns
// before they ship. Usage: node scripts/check-matches.mjs <catalog.json> [ingredient ids…]
import { readFileSync } from 'node:fs';
import { INGREDIENTS } from '../src/ingredients.js';
import { RECIPES } from '../src/recipes.js';
import { matchOffer } from '../src/match.js';

const [file, ...only] = process.argv.slice(2);
const { items } = JSON.parse(readFileSync(file, 'utf8'));
const hits = {};
for (const i of items) {
  const offer = { heading: i.title, description: '', price: i.price, quantity: i.amount ? { unit: i.unit, amount: i.amount } : null };
  for (const m of matchOffer(offer, { shelf: i.kind === 'hylde' })) (hits[m.ingredientId] ??= []).push(i);
}
const ids = only.length ? only : Object.keys(INGREDIENTS).filter((id) => INGREDIENTS[id].match && !INGREDIENTS[id].staple);
const out = [`# Match-tjek mod ${items.length} varer`, ''];
for (const id of ids) {
  const list = hits[id] ?? [];
  out.push(`## ${id} (${INGREDIENTS[id].name}): ${list.length} varer`);
  for (const i of list.slice(0, 15)) out.push(`- ${i.title} · ${i.price} kr · ${i.amount ?? '?'} ${i.unit ?? ''} · ${i.kind}`);
  out.push('');
}
out.push('## Ingredienser uden et eneste match i dag');
const used = new Set(RECIPES.flatMap((r) => r.ingredients.map(([id]) => id)));
out.push([...used].filter((id) => !INGREDIENTS[id].staple && !(hits[id]?.length)).join(', ') || '–');
console.log(out.join('\n'));
