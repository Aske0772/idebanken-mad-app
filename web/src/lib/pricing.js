// All price maths lives here so swipe cards, the add sheet, the week view and the
// shopping list agree. Everything is "what you pay at the till": you buy whole
// packs, so 450 g of chicken from a 400 g offer costs two packs.
//
// Where a price comes from, best first:
//   tilbud    – this week's avis in one of your stores
//   fast      – a long-running catalog price in one of your stores
//   hylde     – REMA 1000's shelf price (exact when REMA is one of your stores)
//   reference – REMA's shelf price when you don't shop at REMA (approximate)
//   estimate  – our own estimate, only when no real price exists (approximate)

const EPS = 1e-9;
const packsFor = (need, packSize) => Math.max(1, Math.ceil(need / packSize - EPS));
export const isExact = (source) => ['tilbud', 'fast', 'hylde'].includes(source?.kind);

// Real prices for an ingredient in the chosen stores.
export function offersFor(data, ingredientId, stores) {
  return (data.offers[ingredientId] ?? []).filter((o) => stores.includes(o.store));
}

const best = (candidates, need, kindOf) => {
  let winner = null;
  for (const offer of candidates) {
    const packs = packsFor(need, offer.amount);
    const cost = packs * offer.price;
    if (!winner || cost < winner.cost - EPS) {
      winner = { kind: kindOf(offer), offer, packs, packSize: offer.amount, cost };
    }
  }
  return winner;
};

// Cheapest way to buy `need` units at a real price in your stores; otherwise the
// closest real reference; otherwise an estimate.
export function cheapest(data, ingredientId, need, stores) {
  const exact = best(offersFor(data, ingredientId, stores), need, (o) => o.kind ?? 'tilbud');
  if (exact) return exact;
  const shelf = (data.offers[ingredientId] ?? []).filter((o) => o.kind === 'hylde');
  const reference = best(shelf, need, () => 'reference');
  if (reference) return reference;
  const [normalSize, normalPrice] = data.ingredients[ingredientId].normal;
  const packs = packsFor(need, normalSize);
  return { kind: 'estimate', packs, packSize: normalSize, cost: packs * normalPrice };
}

// Running avis tilbud on a dish's hero ingredients in the chosen stores.
export function heroOffers(data, recipe, stores) {
  return recipe.hero.flatMap((id) =>
    offersFor(data, id, stores)
      .filter((o) => (o.kind ?? 'tilbud') === 'tilbud')
      .map((offer) => ({ ingredientId: id, offer }))
  );
}

export function isOnOffer(data, recipe, stores) {
  return heroOffers(data, recipe, stores).length > 0;
}

// Price one dish for a number of people and days.
// staples: ids of basisvarer the user needs to buy for this dish.
// atHome: ids the user already has – never priced.
export function priceDish(data, recipe, { people, days, staples = [], atHome = [], stores }) {
  const factor = (people * days) / recipe.serves;
  const lines = recipe.ingredients.map(({ id, qty }) => {
    const ing = data.ingredients[id];
    const need = qty * factor;
    const included = ing.staple ? staples.includes(id) : !atHome.includes(id);
    const source = included ? cheapest(data, id, need, stores) : null;
    return { id, ing, need, staple: ing.staple, included, source };
  });
  const total = lines.reduce((sum, l) => sum + (l.source?.cost ?? 0), 0);
  const approx = lines.reduce((sum, l) => sum + (l.source && !isExact(l.source) ? l.source.cost : 0), 0);
  const meals = people * days;
  return {
    total,
    approx,
    meals,
    perMeal: meals ? total / meals : 0,
    onOffer: lines.filter((l) => l.source?.kind === 'tilbud').length,
    bought: lines.filter((l) => l.source).length,
    lines
  };
}

// Cheapest price per portion for a typical household – used to sort the deck.
export function portionPrice(data, recipe, stores, people = 2, atHome = []) {
  return priceDish(data, recipe, { people, days: 1, stores, atHome }).perMeal;
}

// The week's shopping list. Needs are summed across dishes before choosing packs,
// so two dishes with onions share one net. Items without a real price in your
// stores go in the 'other' group.
export function shoppingList(data, plan, { stores, atHome = [] }) {
  const recipes = Object.fromEntries(data.recipes.map((r) => [r.id, r]));
  const needs = new Map();
  let meals = 0;
  for (const item of plan) {
    const recipe = recipes[item.recipeId];
    if (!recipe) continue;
    meals += item.people * item.days;
    const factor = (item.people * item.days) / recipe.serves;
    for (const { id, qty } of recipe.ingredients) {
      const ing = data.ingredients[id];
      if (ing.staple && !item.staples?.includes(id)) continue;
      const entry = needs.get(id) ?? { id, ing, need: 0, dishes: [] };
      entry.need += qty * factor;
      if (!entry.dishes.includes(recipe.title)) entry.dishes.push(recipe.title);
      needs.set(id, entry);
    }
  }

  const items = [];
  const home = [];
  for (const entry of needs.values()) {
    if (atHome.includes(entry.id) && !entry.ing.staple) {
      home.push(entry);
      continue;
    }
    items.push({ ...entry, source: cheapest(data, entry.id, entry.need, stores) });
  }

  const total = items.reduce((sum, i) => sum + i.source.cost, 0);
  const approx = items.reduce((sum, i) => sum + (isExact(i.source) ? 0 : i.source.cost), 0);
  const groups = new Map();
  for (const item of items) {
    const key = isExact(item.source) ? item.source.offer.store : 'other';
    const group = groups.get(key) ?? { key, items: [], total: 0 };
    group.items.push(item);
    group.total += item.source.cost;
    groups.set(key, group);
  }
  const order = (key) => (key === 'other' ? Infinity : stores.indexOf(key));
  const sorted = [...groups.values()].sort((a, b) => order(a.key) - order(b.key));
  for (const g of sorted) g.items.sort((a, b) => a.ing.cat.localeCompare(b.ing.cat) || a.ing.name.localeCompare(b.ing.name));

  return { total, approx, meals, perMeal: meals ? total / meals : 0, groups: sorted, home };
}
