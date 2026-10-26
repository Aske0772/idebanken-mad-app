import { describe, it, expect } from 'vitest';
import { cheapest, priceDish, shoppingList, isOnOffer, isExact } from './pricing.js';

const data = {
  ingredients: {
    kylling: { name: 'kyllingebryst', unit: 'g', cat: 'kod', staple: false, normal: [400, 40] },
    ris: { name: 'ris', unit: 'g', cat: 'kolonial', staple: false, normal: [1000, 18] },
    loeg: { name: 'løg', unit: 'stk', cat: 'gront', staple: false, normal: [10, 12] },
    salt: { name: 'salt', unit: 'g', cat: 'basis', staple: true, normal: [1000, 8] }
  },
  offers: {
    kylling: [
      { id: 'n', store: 'netto', price: 25, amount: 400, kind: 'tilbud' },
      { id: 'r', store: 'rema', price: 49, amount: 600, kind: 'tilbud' }
    ],
    ris: [
      { id: 'l', store: 'lidl', price: 8.95, amount: 1000, kind: 'fast' },
      { id: 'rh', store: 'rema', price: 11.95, amount: 1000, kind: 'hylde' }
    ]
  },
  recipes: [
    {
      id: 'karry', title: 'Karry', serves: 4, hero: ['kylling'],
      ingredients: [{ id: 'kylling', qty: 600 }, { id: 'ris', qty: 300 }, { id: 'loeg', qty: 1 }, { id: 'salt', qty: 3 }]
    },
    {
      id: 'wok', title: 'Wok', serves: 4, hero: ['kylling'],
      ingredients: [{ id: 'kylling', qty: 400 }, { id: 'loeg', qty: 1 }]
    },
    {
      id: 'risret', title: 'Risret', serves: 4, hero: ['ris'],
      ingredients: [{ id: 'ris', qty: 300 }]
    }
  ]
};

describe('cheapest', () => {
  it('buys whole packs of the best offer', () => {
    // 600 g: REMA 1 × 600 g = 49 kr beats Netto 2 × 400 g = 50 kr.
    expect(cheapest(data, 'kylling', 600, ['netto', 'rema'])).toMatchObject({ kind: 'tilbud', packs: 1, cost: 49 });
    expect(cheapest(data, 'kylling', 400, ['netto', 'rema'])).toMatchObject({ kind: 'tilbud', packs: 1, cost: 25 });
  });

  it('only uses real prices from chosen stores', () => {
    expect(cheapest(data, 'kylling', 600, ['rema']).offer.store).toBe('rema');
    expect(cheapest(data, 'ris', 300, ['lidl'])).toMatchObject({ kind: 'fast', cost: 8.95 });
    expect(cheapest(data, 'ris', 300, ['rema'])).toMatchObject({ kind: 'hylde', cost: 11.95 });
  });

  it('falls back to REMA shelf price as a labelled reference, then to an estimate', () => {
    const ref = cheapest(data, 'ris', 300, ['netto']);
    expect(ref).toMatchObject({ kind: 'reference', cost: 11.95 });
    expect(isExact(ref)).toBe(false);
    const est = cheapest(data, 'loeg', 2, ['netto']);
    expect(est).toMatchObject({ kind: 'estimate', packs: 1, cost: 12 });
    expect(isExact(est)).toBe(false);
  });
});

describe('priceDish', () => {
  it('scales with people and days and leaves staples out', () => {
    const p = priceDish(data, data.recipes[0], { people: 4, days: 2, stores: ['netto'] });
    // 1200 g chicken = 3 × 25, 600 g rice = REMA reference 11.95, 2 onions = estimate 12
    expect(p.total).toBeCloseTo(75 + 11.95 + 12);
    expect(p.approx).toBeCloseTo(11.95 + 12);
    expect(p.meals).toBe(8);
    expect(p.lines.find((l) => l.id === 'salt').source).toBeNull();
  });

  it('adds a staple when the user needs it', () => {
    const p = priceDish(data, data.recipes[0], { people: 4, days: 1, staples: ['salt'], stores: ['netto'] });
    expect(p.lines.find((l) => l.id === 'salt').source.cost).toBe(8);
  });

  it('skips what the user has at home', () => {
    const p = priceDish(data, data.recipes[0], { people: 4, days: 1, atHome: ['ris'], stores: ['netto'] });
    expect(p.lines.find((l) => l.id === 'ris').source).toBeNull();
  });
});

describe('shoppingList', () => {
  it('shares packs across dishes and groups by store', () => {
    const plan = [
      { recipeId: 'karry', days: 1, people: 4, staples: [] },
      { recipeId: 'wok', days: 1, people: 4, staples: [] }
    ];
    const list = shoppingList(data, plan, { stores: ['netto'] });
    const onions = list.groups.find((g) => g.key === 'other').items.find((i) => i.id === 'loeg');
    expect(onions.need).toBe(2);
    expect(onions.source.packs).toBe(1); // one net covers both dishes
    expect(list.groups[0].key).toBe('netto');
    expect(list.meals).toBe(8);
    expect(list.approx).toBeGreaterThan(0);
  });
});

it('only a running avis tilbud puts a dish in the deck', () => {
  expect(isOnOffer(data, data.recipes[0], ['netto'])).toBe(true);
  expect(isOnOffer(data, data.recipes[0], ['lidl'])).toBe(false);
  // Lidl's rice is a catalog price, not a tilbud.
  expect(isOnOffer(data, data.recipes[2], ['lidl'])).toBe(false);
});
