import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSize, normalizeProduct } from '../src/sources/rema.js';

test('parses REMA pack sizes', () => {
  assert.deepEqual(parseSize('530 GR. / KLASSISK'), { unit: 'kg', amount: 0.53 });
  assert.deepEqual(parseSize('1 KG. / REMA 1000'), { unit: 'kg', amount: 1 });
  assert.deepEqual(parseSize('0.5 LTR. / REMA 1000'), { unit: 'l', amount: 0.5 });
  assert.deepEqual(parseSize('10 STK. / STR. M/L'), { unit: 'pcs', amount: 10 });
  assert.deepEqual(parseSize('4 X 125 GR.'), { unit: 'kg', amount: 0.5 });
  assert.equal(parseSize('1 BAKKE / LAND'), null);
});

test('uses the regular price, never a campaign price', () => {
  const p = normalizeProduct({
    id: 1, name: 'SPAGHETTI', underline: '1 KG. / REMA 1000', images: [],
    prices: [
      { price: 5, is_campaign: true, is_advertised: true, starting_at: '2026-10-20T00:00:00+00:00', ending_at: '2026-10-27T00:00:00+00:00' },
      { price: 8.95, is_campaign: false, is_advertised: false, starting_at: '2026-10-01T00:00:00+00:00', ending_at: '2026-11-30T00:00:00+00:00' }
    ]
  });
  assert.equal(p.price, 8.95);
  assert.equal(p.heading, 'Spaghetti');
  assert.equal(p.runTill, '2026-11-30T00:00:00.000Z');
});
