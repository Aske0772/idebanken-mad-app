import { describe, it, expect } from 'vitest';
import { cheapest, priceDish, shoppingList, isOnOffer, isExact, addedCost, suggestions } from './pricing.js';

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

describe('shared packs', () => {
  const plan = [
    { id: 'a', recipeId: 'karry', days: 1, people: 4, staples: [] },
    { id: 'b', recipeId: 'wok', days: 1, people: 4, staples: [] }
  ];

  it('splits a shared pack between the dishes, so their shares add up to the total', () => {
    const list = shoppingList(data, plan, { stores: ['netto'] });
    expect(list.shares.a + list.shares.b).toBeCloseTo(list.total);
    // Each dish pays half of the one onion net (12 kr), not a whole net each.
    const standalone = priceDish(data, data.recipes[1], { people: 4, days: 1, stores: ['netto'] }).total;
    expect(list.shares.b).toBeLessThan(standalone);
  });

  it('charges a new dish only for what the week does not already buy', () => {
    // Wok next to karry: the chicken packs grow, but the onions are already in the net.
    const extra = addedCost(data, [plan[0]], { recipeId: 'wok', people: 4, days: 1, staples: [] }, { stores: ['netto'] });
    const standalone = priceDish(data, data.recipes[1], { people: 4, days: 1, stores: ['netto'] }).total;
    expect(extra).toBeLessThan(standalone);
  });

  it('suggests dishes that use what is already on the list', () => {
    const out = suggestions(data, [plan[0]], { stores: ['netto'], people: 4 });
    expect(out.map((s) => s.recipe.id)).toEqual(['wok']); // shares chicken and onions; risret shares only rice
    expect(out[0].shared).toEqual(['kylling', 'loeg']);
    expect(suggestions(data, [], { stores: ['netto'] })).toEqual([]);
  });
});

describe('hand-added products', () => {
  it('go in their store and count in the total', () => {
    const extras = [{ id: 'kaffe', store: 'netto', title: 'Kaffe 400 g', price: 30, qty: 2, kind: 'tilbud' }];
    const list = shoppingList(data, [], { stores: ['netto'], extras });
    expect(list.total).toBe(60);
    expect(list.groups[0].key).toBe('netto');
    expect(list.groups[0].items[0]).toMatchObject({ id: 'x-kaffe', source: { cost: 60, packs: 2 } });
  });
});

describe('pack choice', () => {
  const milk = {
    ingredients: { maelk: { name: 'mælk', unit: 'ml', cat: 'mejeri', staple: false, normal: [1000, 13] } },
    offers: {
      maelk: [
        { id: 'small', store: 'rema', price: 3.95, amount: 250, kind: 'hylde' },
        { id: 'liter', store: 'rema', price: 10.95, amount: 1000, kind: 'hylde' }
      ]
    },
    recipes: []
  };
  it('takes a liter over two small cartons when it costs only a little more', () => {
    expect(cheapest(milk, 'maelk', 500, ['rema'])).toMatchObject({ offer: { id: 'liter' }, packs: 1, cost: 10.95 });
  });
  it('keeps the small pack when the big one costs much more', () => {
    expect(cheapest(milk, 'maelk', 200, ['rema']).offer.id).toBe('small');
  });
});

describe('+ and − on the list', () => {
  const plan = [{ id: 'p1', recipeId: 'karry', people: 4, days: 1, staples: [] }];
  it('buys extra packs without changing what the dish costs', () => {
    const base = shoppingList(data, plan, { stores: ['netto'] });
    const more = shoppingList(data, plan, { stores: ['netto'], adjust: { kylling: 1 } });
    const line = more.groups.flatMap((g) => g.items).find((i) => i.id === 'kylling');
    expect(line.source.packs).toBe(base.groups.flatMap((g) => g.items).find((i) => i.id === 'kylling').source.packs + 1);
    expect(more.total - base.total).toBe(25);
    expect(more.dishTotal).toBe(base.dishTotal);
    expect(more.shares.p1).toBe(base.shares.p1);
  });
  it('never goes below one pack', () => {
    const list = shoppingList(data, plan, { stores: ['netto'], adjust: { kylling: -9 } });
    expect(list.groups.flatMap((g) => g.items).find((i) => i.id === 'kylling').source.packs).toBe(1);
  });
  it('puts another brand of an ingredient right below its line', () => {
    const extras = [
      { id: 'kaffe', store: 'netto', title: 'Kaffe', price: 30, qty: 1, kind: 'tilbud' },
      { id: 'k2', store: 'netto', title: 'Andet kyllingebryst', price: 30, qty: 1, kind: 'tilbud', ing: 'kylling' }
    ];
    const ids = shoppingList(data, plan, { stores: ['netto'], extras }).groups[0].items.map((i) => i.id);
    expect(ids.indexOf('x-k2')).toBe(ids.indexOf('kylling') + 1);
    expect(ids.at(-1)).toBe('x-kaffe');
  });
});
