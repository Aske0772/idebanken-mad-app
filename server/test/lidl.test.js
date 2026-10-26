import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTiles, parsePack, LIDL_STORE_ID } from '../src/sources/lidl.js';

// lidl.dk renders each product tile with its data HTML-escaped in data-grid-data.
const tile = (data) => `<div data-grid-data="${JSON.stringify(data).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></div>`;
const everyday = (overrides = {}) => ({
  productId: 1001, fullTitle: 'Sukker', category: 'Food', storeStartDate: 1792879200, storeEndDate: null,
  price: { price: 6, packaging: { text: '1 kg' }, basePrice: { text: 'Pr. kg 6,00' } },
  ...overrides
});

test('reads everyday food prices from product tiles', () => {
  const [p] = parseTiles(tile(everyday()));
  assert.deepEqual(p, {
    id: 'lidl-1001', storeId: LIDL_STORE_ID, heading: 'Sukker', description: '1 kg · Pr. kg 6,00',
    price: 6, prePrice: null, quantity: { unit: 'kg', amount: 1 }, image: null,
    runFrom: new Date(1792879200 * 1000).toISOString(), runTill: null
  });
});

test('skips non-food, Lidl Plus-only prices and tiles that are offers', () => {
  const html = [
    tile(everyday({ productId: 1, fullTitle: 'Afløbsrens', category: 'Nonfood' })),
    tile(everyday({ productId: 2, fullTitle: 'Kærgården', price: { price: null } })),
    tile(everyday({ productId: 3, fullTitle: 'MADVÆRKET Hvedetoastbrød', storeEndDate: 1793487599 })),
    tile(everyday({ productId: 4, fullTitle: 'Danbo & ost', price: { price: 69, packaging: { text: '900 g' } } }))
  ].join('\n');
  assert.deepEqual(parseTiles(html).map((p) => p.heading), ['Danbo & ost']);
});

test('parses Lidl pack sizes', () => {
  assert.deepEqual(parsePack('600 g'), { unit: 'kg', amount: 0.6 });
  assert.deepEqual(parsePack('1 kg'), { unit: 'kg', amount: 1 });
  assert.deepEqual(parsePack('500 ml'), { unit: 'l', amount: 0.5 });
  assert.deepEqual(parsePack('1 l'), { unit: 'l', amount: 1 });
  assert.deepEqual(parsePack('500-1000 ml'), { unit: 'l', amount: 0.5 });
  assert.deepEqual(parsePack('100 x 15,25 g'), { unit: 'kg', amount: 1.525 });
  assert.deepEqual(parsePack('1/Stk.'), { unit: 'pcs', amount: 1 });
  assert.equal(parsePack(''), null);
});
