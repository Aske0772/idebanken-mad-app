import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchDealerOffers, normalizeOffer, prePriceFrom } from '../src/sources/tjek.js';

test('fetches every running nationwide avis, in page order, without duplicates', async () => {
  const catalogs = [
    { id: 'uge45', offer_count: 150, run_till: '2026-11-12T22:59:59+0000' },
    { id: 'magasin', offer_count: 0, run_till: '2026-12-31T22:59:59+0000' },
    { id: 'lokal', offer_count: 40, all_stores: false, run_till: '2026-11-12T22:59:59+0000' },
    { id: 'uge43', offer_count: 90, run_till: '2026-10-29T22:59:59+0000' }
  ];
  const offer = (id) => ({ id, dealer_id: '9ba51', heading: id, pricing: { price: 10 } });
  const asked = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (href) => {
    const url = new URL(href);
    asked.push(url);
    const offset = Number(url.searchParams.get('offset'));
    let body = catalogs;
    if (url.pathname.endsWith('/offers')) {
      // 150 offers over two pages; the second page repeats one from the first.
      body = offset === 0
        ? Array.from({ length: 100 }, (_, i) => offer(`o${i}`))
        : [offer('o99'), ...Array.from({ length: 50 }, (_, i) => offer(`o${100 + i}`))];
    }
    return new Response(JSON.stringify(body), { status: 200 });
  };
  try {
    const got = await fetchDealerOffers('9ba51', { now: Date.parse('2026-11-04T12:00:00Z') });
    assert.equal(got.length, 150);
    const offerCalls = asked.filter((u) => u.pathname.endsWith('/offers'));
    assert.deepEqual([...new Set(offerCalls.map((u) => u.searchParams.get('catalog_ids')))], ['uge45']);
    assert.ok(offerCalls.every((u) => u.searchParams.get('order_by') === 'page'));
    assert.ok(asked.every((u) => !u.searchParams.has('r_lat')));
    assert.equal(asked.find((u) => u.pathname.endsWith('/catalogs')).searchParams.get('types'), 'paged,incito');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('reads the stated normal price out of the avis text', () => {
  assert.equal(prePriceFrom('400 g.\nPr. kg 24,93\nNormalpris 20,75\nMax. 6 stk.', 9.97), 20.75);
  assert.equal(prePriceFrom('PR. NET\n1 kg. Danmark.\nNormalpris 12.-', 6), 12);
  assert.equal(prePriceFrom('Før 29,95', 19.95), 29.95);
  assert.equal(prePriceFrom('500 g. Spar 10,-', 25), 35);
  assert.equal(prePriceFrom('Spar op til 50%', 25), null);
  assert.equal(prePriceFrom('Spar 20%', 25), null);
  assert.equal(prePriceFrom('400 g. 72.50 pr. kg', 29), null);
  assert.equal(prePriceFrom('', 29), null);
});

test('keeps only facts: no image, no marketing text, before-price from text when missing', () => {
  const o = normalizeOffer({
    id: 'x', dealer_id: '9ba51', heading: ' Mutti tomater ', description: '400 g. Normalpris 20,75',
    pricing: { price: 9.97, pre_price: null }, images: { thumb: 'https://img/x.jpg' },
    quantity: { unit: { si: { symbol: 'kg', factor: 0.001 } }, size: { from: 400 }, pieces: { from: 1 } },
    run_from: '2026-10-23T22:00:00+0000', run_till: '2026-10-30T22:00:00+0000'
  });
  assert.equal(o.image, null);
  assert.equal(o.description, '');
  assert.equal(o.prePrice, 20.75);
  assert.deepEqual(o.quantity, { unit: 'kg', amount: 0.4 });
  assert.equal(o.heading, 'Mutti tomater');
});
