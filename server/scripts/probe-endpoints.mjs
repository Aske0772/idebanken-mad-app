// Round 2: targeted GETs against the product/search endpoints round 1 found in
// the chains' own front-end code. Same rules: robots.txt first, no cookies, no
// keys, honest User-Agent, pause per host. Prints robots rules for the hosts and
// a short sample of each JSON answer so we can see whether prices are in it.
//
// Usage: node scripts/probe-endpoints.mjs [outDir]

import { writeFile, appendFile, mkdir } from 'node:fs/promises';
import { get, robotsFor, allowed, jsonSummary } from './probe-sources.mjs';

const OUT = process.argv[2] ?? 'probe-out';
const q = encodeURIComponent('mælk');

const TARGETS = [
  ['nemlig.com', `https://www.nemlig.com/searchgateway/api/search?query=${q}&take=5`],
  ['nemlig.com', `https://www.nemlig.com/searchgateway/api/quick?query=${q}&take=5`],
  ['Salling', `https://salling.dk/api/search/SuggestiveSearch?query=${q}`],
  ['Bilka ToGo', 'https://api.bilkatogo.dk/api/shop/ConsumerFacingHierarchy'],
  ['Bilka ToGo', 'https://api.bilkatogo.dk/api/structure/Initialize'],
  ['Føtex', 'https://www.foetex.dk/all-products/'],
  ['MENY', 'https://api.meny.dk/api'],
  ['SPAR', 'https://api.spar.dk/api'],
  ['Wolt', 'https://consumer-api.wolt.com/v1/pages/restaurants?lat=55.6761&lon=12.5683'],
  ['Wolt', `https://restaurant-api.wolt.com/v1/search?q=${encodeURIComponent('wolt market')}&lat=55.6761&lon=12.5683`]
];

const ROBOTS_FOR = ['https://www.nemlig.com', 'https://salling.dk', 'https://api.bilkatogo.dk', 'https://www.bilkatogo.dk',
  'https://www.foetex.dk', 'https://netto.dk', 'https://api.meny.dk', 'https://consumer-api.wolt.com', 'https://restaurant-api.wolt.com'];

// First object in the JSON that carries a price-like key, trimmed.
function priceSample(body) {
  let data;
  try { data = JSON.parse(body); } catch { return null; }
  const stack = [data];
  let n = 0;
  while (stack.length && n++ < 20000) {
    const v = stack.shift();
    if (v && typeof v === 'object') {
      if (!Array.isArray(v) && Object.keys(v).some((k) => /^(price|prices|pris|unitprice|salesprice|normalprice|currentprice)$/i.test(k))) {
        return JSON.stringify(v).slice(0, 400);
      }
      stack.push(...(Array.isArray(v) ? v : Object.values(v)));
    }
  }
  return null;
}

const lines = ['# Probe runde 2: målrettede endpoints', '', '## robots.txt', ''];
for (const origin of ROBOTS_FOR) {
  const r = await robotsFor(origin);
  const dis = r.rules.filter((x) => !x.allow).map((x) => x.path);
  lines.push(`- **${origin}** (HTTP ${r.status}): ${dis.length ? dis.map((d) => `\`${d}\``).join(' ') : 'ingen Disallow'}`);
}
lines.push('', '## Endpoints', '');
for (const [chain, url] of TARGETS) {
  const ok = await allowed(url);
  if (!ok.ok) { lines.push(`### ${chain}`, `\`${url}\``, `- Sprunget over: ${ok.rule}`, ''); continue; }
  const r = await get(url, 'application/json, text/html;q=0.8');
  const js = jsonSummary(r.body);
  const priceTexts = (r.body.match(/\b\d{1,4}[,.]\d{2}\s*(kr\b|,-)|\bkr\.?\s*\d{1,4}[,.]\d{2}/gi) ?? []).length;
  lines.push(`### ${chain}`, `\`${url}\``,
    `- HTTP ${r.status || r.error} · ${r.type.split(';')[0]} · ${r.bytes} B${js.json ? ` · JSON (${js.top}) · pris-felter: ${js.priceKeys}` : ` · pris-tekster i HTML: ${priceTexts}`}`);
  const sample = js.json ? priceSample(r.body) : null;
  if (sample) lines.push(`- Eksempel: \`${sample.replace(/`/g, "'")}\``);
  else if (js.json) lines.push(`- Start af svar: \`${r.body.slice(0, 300).replace(/`/g, "'").replace(/\s+/g, ' ')}\``);
  lines.push('');
}
const md = lines.join('\n') + '\n';
await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/probe-endpoints.md`, md);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, md);
console.log(md);
