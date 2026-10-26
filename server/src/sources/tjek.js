// Offer source: the public Tjek API that powers eTilbudsavis.
// Prototype only – for production, license the data (Tjek sells API access) or get
// permission from each chain. Requests are sequential and throttled.

const BASE = 'https://squid-api.tjek.com/v2';
const PAGE = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchDealerOffers(dealerId, { lat, lng, radius = 50000, max = 1000 } = {}) {
  const offers = [];
  for (let offset = 0; offset < max; offset += PAGE) {
    const url = new URL(`${BASE}/offers`);
    url.search = new URLSearchParams({
      dealer_ids: dealerId,
      r_lat: lat,
      r_lng: lng,
      r_radius: radius,
      limit: PAGE,
      offset
    });
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'idebanken-mad-app/0.1 (prototype)' },
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) throw new Error(`Tjek ${dealerId} offset ${offset}: HTTP ${res.status}`);
    const page = await res.json();
    offers.push(...page);
    if (page.length < PAGE) break;
    await sleep(250);
  }
  return offers.map(normalizeOffer);
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
  return {
    id: o.id,
    storeId: o.dealer_id,
    heading: o.heading?.trim() ?? '',
    description: o.description ?? '',
    price: o.pricing?.price ?? null,
    prePrice: o.pricing?.pre_price ?? null,
    quantity,
    image: o.images?.thumb ?? null,
    runFrom: iso(o.run_from),
    runTill: iso(o.run_till)
  };
}

// Tjek dates look like "2026-10-23T22:00:00+0000"; store them as plain UTC ISO strings
// so they compare correctly as text.
const iso = (s) => (s ? new Date(s).toISOString() : null);
