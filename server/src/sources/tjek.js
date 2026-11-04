// Offer source: the public Tjek API that powers eTilbudsavis.
// Prototype only – for production, license the data (Tjek sells API access) or get
// permission from each chain. Requests go through the polite client in http.js.
//
// Only facts are kept: product name, pack size, price, before-price and validity.
// Images and marketing text are never stored.

import { politeFetch } from './http.js';

const BASE = 'https://squid-api.tjek.com/v2';
const PAGE = 100;
// Tjek refuses offsets past 1000, so a query can return at most this many rows.
const MAX_ROWS = 1000;

// Every offer in a chain's current and upcoming aviser that run in all its stores
// (no location filter). Fetched avis by avis, because a chain-wide query stops at
// 1000 offers (Bilka has more), and in page order, because without a fixed order
// Tjek's pages overlap and skip offers. Coop publishes each avis twice, as a paged
// PDF and as a digital ("incito") avis with partly different offers, so both are
// read; the copies they share, and offers printed in two aviser of the same chain
// (Lidl's week and weekend avis), are kept once.
export async function fetchDealerOffers(dealerId, { now = Date.now() } = {}) {
  const catalogs = await fetchAll('catalogs', { dealer_ids: dealerId, types: 'paged,incito' }, `Tjek ${dealerId} aviser`);
  const offers = new Map();
  for (const c of catalogs) {
    if (!c.offer_count || c.all_stores === false || Date.parse(c.run_till) <= now) continue;
    const rows = await fetchAll('offers', { catalog_ids: c.id, order_by: 'page' }, `Tjek avis ${c.id}`);
    for (const o of rows.map(normalizeOffer)) {
      offers.set([sameName(o.heading), o.price, o.quantity?.amount, o.runFrom, o.runTill].join('|'), o);
    }
  }
  return [...offers.values()];
}

// The two versions of an avis spell names slightly differently
// ("kyllinge-lårfilet" / "kyllingelårfilet", "- lårmix" / "-lårmix").
const sameName = (s) => s.toLowerCase().replace(/[^a-zæøåäöü0-9%]/g, '');

async function fetchAll(path, params, label) {
  const rows = [];
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE) {
    const url = new URL(`${BASE}/${path}`);
    url.search = new URLSearchParams({ ...params, limit: PAGE, offset });
    const res = await politeFetch(url.href, { label: `${label} offset ${offset}` });
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

// Flatten a Tjek offer into what the matcher needs. Quantity is expressed in SI
// units (kg, l or pcs) so the matcher can convert to ingredient units.
export function normalizeOffer(o) {
  const q = o.quantity || {};
  const si = q.unit?.si;
  const sizeFrom = q.size?.from ?? null;
  const pieces = q.pieces?.from ?? 1;
  let quantity = null;
  if (si && sizeFrom != null) {
    quantity = { unit: si.symbol, amount: sizeFrom * si.factor * pieces };
  }
  const price = o.pricing?.price ?? null;
  return {
    id: o.id,
    storeId: o.dealer_id,
    heading: o.heading?.replace(/\s+/g, ' ').trim() ?? '', // digital aviser pad with spaces
    description: '', // marketing text is read for the before-price below, then dropped
    price,
    prePrice: o.pricing?.pre_price ?? prePriceFrom(o.description, price),
    quantity,
    image: null,
    runFrom: iso(o.run_from),
    runTill: iso(o.run_till)
  };
}

// The avis text often states the normal price ("Normalpris 20,75", "Før 29,95",
// "Spar 10,-"). By the Danish price-marking rules that figure must be the lowest
// price of the previous 30 days, so it is a reliable shelf price.
export function prePriceFrom(text, price) {
  if (!text) return null;
  const t = text.replace(/\u00a0/g, ' ');
  const stated = t.match(/\b(?:normalpris|førpris|før|normalt)\s*:?\s*(\d+(?:[.,]\d{1,2})?)(?:[.,]-)?/i);
  if (stated) return money(stated[1]);
  const saved = t.match(/\bspar\s+(?!op\s+til|mindst|min\.)(\d+(?:[.,]\d{1,2})?)(?![\d.,]*\s*%)/i);
  if (saved && price != null) return Math.round((price + money(saved[1])) * 100) / 100;
  return null;
}

const money = (s) => Number(s.replace(',', '.'));

// Tjek dates look like "2026-10-23T22:00:00+0000"; store them as plain UTC ISO strings
// so they compare correctly as text.
const iso = (s) => (s ? new Date(s).toISOString() : null);
