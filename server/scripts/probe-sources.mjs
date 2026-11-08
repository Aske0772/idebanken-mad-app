// Probe: which Danish grocery chains expose prices without a token?
//
// Read-only reconnaissance, run once by hand or in CI. For each chain it
//   1. reads robots.txt and skips every path it disallows,
//   2. fetches the public front page and its own script bundles,
//   3. lists the API hosts/paths the site's own code calls, and flags auth
//      hints (API-key headers, Algolia keys, Bearer tokens) by NAME only,
//   4. tries a few GET endpoints without cookies or tokens and records the
//      status and whether the answer contains prices.
//
// It never logs in, never sends a key or cookie it found, never stores token
// values, and keeps a pause between calls to the same host. Same honest
// User-Agent as the app (see src/sources/http.js).
//
// Usage: node scripts/probe-sources.mjs [outDir]

import { writeFile, appendFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { USER_AGENT } from '../src/sources/http.js';

const OUT = process.argv[2] ?? 'probe-out';
const GAP_MS = 1000;
const TIMEOUT_MS = 20000;
const MAX_BUNDLES = 15;
const MAX_BYTES = 6 * 1024 * 1024;
const MAX_ENDPOINT_TRIES = 6;

const SITES = [
  { chain: 'REMA 1000', home: 'https://shop.rema1000.dk/',
    tries: ['https://api.digital.rema1000.dk/api/v3/departments/10/products?per_page=5&page=1'] },
  { chain: 'Bilka ToGo (Salling)', home: 'https://www.bilkatogo.dk/' },
  { chain: 'Føtex (Salling)', home: 'https://www.foetex.dk/' },
  { chain: 'Netto (Salling)', home: 'https://netto.dk/' },
  { chain: 'Salling', home: 'https://salling.dk/' },
  { chain: 'nemlig.com', home: 'https://www.nemlig.com/' },
  { chain: 'Lidl', home: 'https://www.lidl.dk/' },
  { chain: 'MENY', home: 'https://meny.dk/' },
  { chain: 'SPAR', home: 'https://spar.dk/' },
  { chain: 'Min Købmand', home: 'https://minkoebmand.dk/' },
  { chain: 'Løvbjerg', home: 'https://www.lovbjerg.dk/' },
  { chain: 'ABC Lavpris', home: 'https://www.abc-lavpris.dk/' },
  { chain: '365discount (Coop)', home: 'https://365discount.coop.dk/' },
  { chain: 'SuperBrugsen (Coop)', home: 'https://superbrugsen.coop.dk/' },
  { chain: 'Kvickly (Coop)', home: 'https://kvickly.coop.dk/' },
  { chain: 'Wolt Market', home: 'https://wolt.com/da/dnk/copenhagen' }
];

const AUTH_HINTS = [
  ['Algolia-nøgle', /x-algolia-api-key|algolia[-_ ]?(app(lication)?[-_ ]?id|api[-_ ]?key|search[-_ ]?key)/i],
  ['Azure APIM-nøgle (Ocp-Apim-Subscription-Key)', /ocp-apim-subscription-key/i],
  ['x-api-key-header', /["'`]x-api-key["'`]/i],
  ['Bearer-token', /authorization["'`]?\s*[:,]\s*["'`]bearer/i],
  ['subscription key', /subscription[-_]?key/i],
  ['client secret', /client[-_]?secret/i],
  ['access_token', /access[-_]token/i],
  ['GraphQL', /\/graphql\b/i]
];
const API_WORDS = /api|search|graphql|product|catalog|assortment|price|algolia|webapi|offer/i;
const PRICE_TEXT = /\b\d{1,4}[,.]\d{2}\s*(kr\b|,-)|\bkr\.?\s*\d{1,4}[,.]\d{2}/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lastHit = new Map();
const robotsCache = new Map();

export async function get(url, accept) {
  const host = new URL(url).host;
  const wait = (lastHit.get(host) ?? 0) + GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const body = buf.subarray(0, MAX_BYTES).toString('utf8');
    return { status: res.status, type: res.headers.get('content-type') ?? '', finalUrl: res.url, body, bytes: buf.length };
  } catch (err) {
    return { status: 0, type: '', finalUrl: url, body: '', bytes: 0, error: err.name === 'TimeoutError' ? 'timeout' : err.message };
  }
}

// --- robots.txt (groups for "*" and "maet"; longest match wins, Allow beats Disallow on ties)
function parseRobots(text) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, key, value] = m;
    const k = key.toLowerCase();
    if (k === 'user-agent') {
      if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (cur && (k === 'allow' || k === 'disallow')) cur.rules.push({ allow: k === 'allow', path: value });
    }
  }
  const mine = groups.filter((g) => g.agents.some((a) => a.includes('maet')));
  const chosen = mine.length ? mine : groups.filter((g) => g.agents.includes('*'));
  return chosen.flatMap((g) => g.rules).filter((r) => r.path !== '' || !r.allow);
}

function ruleMatches(rulePath, path) {
  if (rulePath === '') return false;
  const re = '^' + rulePath.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$');
  return new RegExp(re).test(path);
}

export async function robotsFor(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  const r = await get(`${origin}/robots.txt`, 'text/plain');
  // RFC 9309: 4xx = no rules; unreachable or 5xx = treat everything as disallowed.
  const unreachable = r.status === 0 || r.status >= 500;
  const rules = r.status === 200 ? parseRobots(r.body) : unreachable ? [{ allow: false, path: '/' }] : [];
  const entry = { status: r.status, rules };
  robotsCache.set(origin, entry);
  return entry;
}

export async function allowed(url) {
  const u = new URL(url);
  const robots = await robotsFor(u.origin);
  const path = u.pathname + u.search;
  let best = null;
  for (const rule of robots.rules) {
    if (!ruleMatches(rule.path, path)) continue;
    if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) best = rule;
  }
  return !best || best.allow ? { ok: true } : { ok: false, rule: `Disallow: ${best.path}` };
}

// --- helpers
const redact = (url) => url.replace(/([?&][^=&]*(key|token|secret|sig|auth)[^=&]*=)[^&]*/gi, '$1***');

function scriptSrcs(html, base) {
  const out = new Set();
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    try { out.add(new URL(m[1], base).href); } catch { /* ignore */ }
  }
  return [...out];
}

function findEndpoints(text, base) {
  const found = new Set();
  for (const m of text.matchAll(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s"'`<>)\\]{0,160})?/gi)) {
    if (API_WORDS.test(m[0]) && !/\.(png|jpe?g|svg|webp|gif|css|woff2?|ico)(\?|$)/i.test(m[0])) found.add(m[0]);
  }
  for (const m of text.matchAll(/["'`](\/(?:api|webapi|graphql|search|umbraco\/api)[^"'`\s]{0,160})["'`]/gi)) {
    try { found.add(new URL(m[1], base).href); } catch { /* ignore */ }
  }
  return [...found];
}

function authHints(text) {
  return AUTH_HINTS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

export function jsonSummary(body) {
  try {
    const data = JSON.parse(body);
    const s = JSON.stringify(data);
    const priceKeys = (s.match(/"(price|prices|pris|amount|unitPrice|salesPrice|normalPrice|currentPrice)"\s*:/gi) ?? []).length;
    const top = Array.isArray(data) ? `array[${data.length}]` : Object.keys(data).slice(0, 8).join(', ');
    return { json: true, priceKeys, top };
  } catch {
    return { json: false };
  }
}

const looksCallable = (url) =>
  !/[{}$]|\$\{|%7B|:id\b|<|>/.test(url) && !/googletagmanager|google-analytics|doubleclick|facebook|hotjar|cookiebot|sentry|onetrust|clarity|cdn\.jsdelivr/i.test(url);

// --- probe one site
async function probe(site) {
  const report = { chain: site.chain, home: site.home, notes: [], endpointsSeen: [], hints: [], tries: [] };
  const origin = new URL(site.home).origin;
  const robots = await robotsFor(origin);
  report.robots = robots.status === 200 ? `${robots.rules.filter((r) => !r.allow).length} Disallow-regler`
    : robots.status === 0 || robots.status >= 500 ? `kunne ikke læses (HTTP ${robots.status}) – alt sprunget over`
    : `ingen robots.txt (HTTP ${robots.status})`;

  const homeOk = await allowed(site.home);
  let texts = [];
  if (!homeOk.ok) {
    report.notes.push(`Forsiden spærret i robots.txt (${homeOk.rule})`);
  } else {
    const home = await get(site.home, 'text/html');
    report.homeStatus = home.status || home.error;
    report.homeBytes = home.bytes;
    report.homePriceTexts = (home.body.match(PRICE_TEXT) ?? []).length;
    report.nextData = /__NEXT_DATA__|__NUXT__|window\.__INITIAL_STATE__/.test(home.body);
    report.jsonLdProducts = (home.body.match(/"@type"\s*:\s*"Product"/g) ?? []).length;
    texts.push([site.home, home.body]);

    let count = 0;
    for (const src of scriptSrcs(home.body, home.finalUrl || site.home)) {
      if (count >= MAX_BUNDLES) break;
      if (!looksCallable(src)) continue;
      const ok = await allowed(src);
      if (!ok.ok) { report.notes.push(`Script spærret: ${new URL(src).host}${new URL(src).pathname} (${ok.rule})`); continue; }
      const js = await get(src, '*/*');
      if (js.status === 200) { texts.push([src, js.body]); count++; }
    }
    report.bundlesScanned = count;
  }

  const seen = new Set();
  for (const [base, text] of texts) {
    for (const e of findEndpoints(text, base)) seen.add(e);
    for (const h of authHints(text)) if (!report.hints.includes(h)) report.hints.push(h);
  }
  report.endpointsSeen = [...seen].map(redact).sort().slice(0, 60);
  report.apiHosts = [...new Set([...seen].map((u) => { try { return new URL(u).host; } catch { return null; } }).filter(Boolean))].sort();

  // Try the configured candidates plus a few discovered GET endpoints, no auth.
  const candidates = [...(site.tries ?? []), ...[...seen].filter(looksCallable).filter((u) => !/\.js(\?|$)/.test(u))];
  const tried = new Set();
  for (const url of candidates) {
    if (report.tries.length >= MAX_ENDPOINT_TRIES) break;
    const key = url.split('?')[0];
    if (tried.has(key)) continue;
    tried.add(key);
    const ok = await allowed(url);
    if (!ok.ok) { report.tries.push({ url: redact(url), skipped: ok.rule }); continue; }
    const r = await get(url, 'application/json');
    report.tries.push({ url: redact(url), status: r.status || r.error, type: r.type.split(';')[0], bytes: r.bytes, ...jsonSummary(r.body) });
  }
  return report;
}

function toMarkdown(reports) {
  const lines = ['# Probe: priskilder uden token', '', `Kørt ${new Date().toISOString()} med User-Agent \`${USER_AGENT}\`.`, ''];
  lines.push('| Kæde | robots.txt | Forside | Pris-tekst i HTML | Bundles | API-hosts | Auth-tegn |', '|---|---|---|---|---|---|---|');
  for (const r of reports) {
    lines.push(`| ${r.chain} | ${r.robots} | ${r.homeStatus ?? 'spærret'} | ${r.homePriceTexts ?? '–'} | ${r.bundlesScanned ?? 0} | ${r.apiHosts.length} | ${r.hints.join(', ') || '–'} |`);
  }
  for (const r of reports) {
    lines.push('', `## ${r.chain}`, '', `Forside: ${r.home} · HTTP ${r.homeStatus ?? '–'} · ${r.homeBytes ?? 0} bytes · SSR-data: ${r.nextData ? 'ja' : 'nej'} · JSON-LD Product: ${r.jsonLdProducts ?? 0}`);
    if (r.notes.length) lines.push('', ...r.notes.map((n) => `- ${n}`));
    lines.push('', `API-hosts: ${r.apiHosts.join(', ') || '–'}`);
    if (r.tries.length) {
      lines.push('', '| Endpoint | Resultat |', '|---|---|');
      for (const t of r.tries) {
        const res = t.skipped ? `sprunget over (${t.skipped})` : `HTTP ${t.status} · ${t.type} · ${t.bytes} B${t.json ? ` · JSON (${t.top}) · pris-felter: ${t.priceKeys}` : ''}`;
        lines.push(`| \`${t.url.slice(0, 140)}\` | ${res} |`);
      }
    }
    if (r.endpointsSeen.length) lines.push('', '<details><summary>Endpoints set i sidens kode</summary>', '', ...r.endpointsSeen.map((e) => `- \`${e.slice(0, 160)}\``), '', '</details>');
  }
  return lines.join('\n') + '\n';
}

async function main() {
const reports = [];
for (const site of SITES) {
  console.log(`→ ${site.chain}`);
  try {
    reports.push(await probe(site));
  } catch (err) {
    reports.push({ chain: site.chain, home: site.home, notes: [`Fejl: ${err.message}`], endpointsSeen: [], apiHosts: [], hints: [], tries: [] });
  }
}
await mkdir(OUT, { recursive: true });
const md = toMarkdown(reports);
await writeFile(`${OUT}/probe-report.md`, md);
await writeFile(`${OUT}/probe-report.json`, JSON.stringify(reports, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, md);
console.log(md);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
