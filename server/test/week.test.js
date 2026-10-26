import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.js';
import { refreshWeek, weekPayload, weekKey, offerKind } from '../src/week.js';

const day = 86400000;
const at = (offsetDays) => new Date(Date.now() + offsetDays * day).toISOString();
const offer = (id, storeId, heading, price, kg, runFrom = at(-1), runTill = at(5)) => ({
  id, storeId, heading, description: '', price, prePrice: null,
  quantity: kg ? { unit: 'kg', amount: kg } : null, image: null, runFrom, runTill
});

const FAKE = {
  '9ba51': [
    offer('a', '9ba51', 'Dansk kyllingebrystfilet', 25, 0.4),
    offer('b', '9ba51', 'Lays chips', 12, 0.175),
    offer('expired', '9ba51', 'Hakket oksekød', 30, 0.5, at(-8), at(-1)),
    offer('future', '9ba51', 'Dansk laksefilet', 50, 0.5, at(2), at(9))
  ],
  '11deC': [offer('c', '11deC', 'REMA 1000 Danske laksefileter', 39, 0.225)],
  // A brand catalog valid for months: a real price, but not a tilbud.
  '71c90': [offer('d', '71c90', 'MADVÆRKET Bacon i strimler', 19.95, 0.25, at(-60), at(60))]
};
const SHELF = [{
  id: 'rema-1', storeId: '11deC', heading: 'Parboiled ris', description: '1 KG. / REMA 1000',
  price: 11.95, prePrice: null, quantity: { unit: 'kg', amount: 1 }, image: null,
  runFrom: at(-10), runTill: at(20)
}];
// Lidl's everyday prices have no end date.
const LIDL_SHELF = [{
  id: 'lidl-1', storeId: '71c90', heading: 'Sukker', description: '1 kg · Pr. kg 6,00',
  price: 6, prePrice: null, quantity: { unit: 'kg', amount: 1 }, image: null,
  runFrom: at(-30), runTill: null
}];
const SHELVES = { '11deC': async () => SHELF, '71c90': async () => LIDL_SHELF };

const refresh = (db, extra = {}) => refreshWeek(db, {
  fetchOffers: async (id) => FAKE[id] ?? [],
  fetchShelves: SHELVES,
  log: () => {},
  ...extra
});

test('refreshWeek stores matched offers and the dishes they unlock', async () => {
  const db = openDb(':memory:');
  const week = await refresh(db);
  assert.equal(week, weekKey());

  const payload = weekPayload(db, week);
  assert.equal(payload.offers.kyllingebryst.length, 1);
  assert.equal(payload.offers.kyllingebryst[0].amount, 400);
  assert.equal(payload.offers.kyllingebryst[0].kind, 'tilbud');
  assert.equal(payload.offers.laks[0].store, '11deC');
  assert.equal(Object.values(payload.offers).flat().some((o) => o.title.includes('chips')), false);

  const inWeek = payload.recipes.filter((r) => r.inWeek).map((r) => r.id);
  assert.ok(inWeek.includes('kylling-i-karry'));
  assert.ok(inWeek.includes('ovnlaks-kartofler'));
  assert.ok(!inWeek.includes('carbonara'), 'bacon is only a catalog price, not a tilbud');
  assert.equal(payload.stores.find((s) => s.id === '9ba51').offerCount, 1);
});

test('only prices valid right now are sent', async () => {
  const db = openDb(':memory:');
  const payload = weekPayload(db, await refresh(db));
  const ids = Object.values(payload.offers).flat().map((o) => o.id);
  assert.ok(!ids.includes('expired'));
  assert.ok(!ids.includes('future'));
});

test('catalog and shelf prices are kept, labelled by kind', async () => {
  const db = openDb(':memory:');
  const payload = weekPayload(db, await refresh(db));
  assert.equal(payload.offers.bacon[0].kind, 'fast');
  assert.deepEqual(payload.offers.ris.map((o) => [o.kind, o.price]), [['hylde', 11.95]]);
  assert.deepEqual(payload.offers.sukker.map((o) => [o.kind, o.store, o.price]), [['hylde', '71c90', 6]]);
});

test('every recipe is sent so planned dishes can still be priced', async () => {
  const db = openDb(':memory:');
  const payload = weekPayload(db, await refresh(db));
  assert.ok(payload.recipes.some((r) => r.id === 'carbonara' && !r.inWeek));
});

test('a store that fails keeps its last good offers', async () => {
  const db = openDb(':memory:');
  await refresh(db);
  await refresh(db, {
    fetchOffers: async (id) => {
      if (id === '9ba51') throw new Error('netto.dk nede');
      return FAKE[id] ?? [];
    }
  });
  const payload = weekPayload(db, weekKey());
  assert.equal(payload.offers.kyllingebryst[0].store, '9ba51');
  assert.match(payload.errors.join(), /netto.dk nede/);
});

test('a failing shelf source keeps its last good prices and leaves the others alone', async () => {
  const db = openDb(':memory:');
  await refresh(db);
  await refresh(db, {
    fetchShelves: { ...SHELVES, '11deC': async () => { throw new Error('offline'); } }
  });
  const payload = weekPayload(db, weekKey());
  assert.match(payload.errors.join(), /REMA 1000 hyldepriser: offline/);
  assert.equal(payload.offers.ris[0].price, 11.95);
  assert.equal(payload.offers.sukker[0].store, '71c90');
});

test('refreshWeek fails loudly when no store answers', async () => {
  const db = openDb(':memory:');
  await assert.rejects(
    refresh(db, { fetchOffers: async () => { throw new Error('offline'); } }),
    /Ingen tilbud/
  );
});

test('offerKind splits weekly avis from long-running catalogs', () => {
  assert.equal(offerKind({ runFrom: at(0), runTill: at(7) }), 'tilbud');
  assert.equal(offerKind({ runFrom: at(0), runTill: at(60) }), 'fast');
  assert.equal(offerKind({ runFrom: null, runTill: at(3) }), 'fast');
});
