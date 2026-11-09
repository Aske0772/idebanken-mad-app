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

// A bigger pack wins over the cheapest total when it costs only a little more and
// is clearly cheaper per kg/l: 1 l milk rather than 2 × 0,25 l, a bag of carrots
// rather than four loose ones.
const BIGGER_PACK_KR = 4;
const BIGGER_PACK_SHARE = 0.3;
const BIGGER_PACK_UNIT = 0.75;

const best = (candidates, need, kindOf) => {
  const options = candidates.map((offer) => {
    const packs = packsFor(need, offer.amount);
    return { offer, packs, cost: packs * offer.price, per: offer.price / offer.amount };
  });
  if (options.length === 0) return null;
  const cheapestTotal = options.reduce((a, b) => (b.cost < a.cost - EPS ? b : a));
  const room = Math.max(BIGGER_PACK_KR, cheapestTotal.cost * BIGGER_PACK_SHARE);
  const better = options
    .filter((o) => o.cost - cheapestTotal.cost <= room + EPS && o.per <= cheapestTotal.per * BIGGER_PACK_UNIT)
    .sort((a, b) => a.per - b.per || a.cost - b.cost)[0];
  const w = better ?? cheapestTotal;
  return { kind: kindOf(w.offer), offer: w.offer, packs: w.packs, packSize: w.offer.amount, cost: w.cost };
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
// so two dishes with carrots share one bag. Items without a real price in your
// stores go in the 'other' group. extras are products the user added by hand
// ("Tilføj vare"); they go in their store's group.
// shares: what each plan item costs as its part of the shared packs, so the
// dishes in the week add up to the list total instead of each paying a whole bag.
// adjust: packs bought beyond (or below) what the dishes need, per ingredient,
// from + and − on the list. Never below one pack; dish prices ignore it.
export function shoppingList(data, plan, { stores, atHome = [], extras = [], adjust = {} }) {
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
      const entry = needs.get(id) ?? { id, ing, need: 0, dishes: [], byItem: {} };
      entry.need += qty * factor;
      entry.byItem[item.id] = (entry.byItem[item.id] ?? 0) + qty * factor;
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

  const shares = {};
  for (const i of items) {
    const perUnit = i.need > 0 ? i.source.cost / i.need : 0;
    for (const [itemId, need] of Object.entries(i.byItem)) shares[itemId] = (shares[itemId] ?? 0) + need * perUnit;
  }
  const dishTotal = items.reduce((sum, i) => sum + i.source.cost, 0);
  // + and − on a dish line change its packs; the difference is counted as extra shopping.
  let adjustTotal = 0;
  for (const i of items) {
    const d = Math.round(adjust[i.id] ?? 0);
    if (!d) continue;
    const packs = Math.max(1, i.source.packs + d);
    const cost = (i.source.cost / i.source.packs) * packs;
    adjustTotal += cost - i.source.cost;
    i.source = { ...i.source, packs, cost, adjusted: packs - (i.source.packs) };
  }
  const approx = items.reduce((sum, i) => sum + (isExact(i.source) ? 0 : i.source.cost), 0);
  const groups = new Map();
  const groupFor = (key) => {
    const group = groups.get(key) ?? { key, items: [], total: 0 };
    groups.set(key, group);
    return group;
  };
  for (const item of items) {
    const group = groupFor(isExact(item.source) ? item.source.offer.store : 'other');
    group.items.push(item);
    group.total += item.source.cost;
  }
  const byName = (a, b) => a.ing.cat.localeCompare(b.ing.cat) || a.ing.name.localeCompare(b.ing.name);
  for (const g of groups.values()) g.items.sort(byName);
  // Hand-added products come after the recipe items in their store, except one of
  // an ingredient already on the list (another brand of agurk): it goes right below it.
  let extrasTotal = adjustTotal;
  for (const x of extras) {
    const cost = x.price * x.qty;
    extrasTotal += cost;
    const group = groupFor(x.store);
    const row = { id: `x-${x.id}`, extra: x, source: { kind: x.kind, offer: x, packs: x.qty, cost } };
    let at = -1;
    if (x.ing) for (let k = group.items.length - 1; k >= 0 && at === -1; k--) {
      const it = group.items[k];
      if (it.id === x.ing || it.extra?.ing === x.ing) at = k + 1;
    }
    if (at === -1) group.items.push(row);
    else group.items.splice(at, 0, row);
    group.total += cost;
  }
  // Your stores in your order, other chains after them, items without a price last.
  const order = (key) => {
    if (key === 'other') return Infinity;
    const i = stores.indexOf(key);
    return i === -1 ? stores.length : i;
  };
  const sorted = [...groups.values()].sort((a, b) => order(a.key) - order(b.key));

  const total = dishTotal + extrasTotal;
  return {
    total, dishTotal, extrasTotal, approx, meals, perMeal: meals ? dishTotal / meals : 0, groups: sorted, home, shares,
    // Needs per ingredient and what was bought for them, for suggestions.
    needs: Object.fromEntries(items.map((i) => [i.id, { need: i.need, bought: i.source.packs * i.source.packSize }]))
  };
}

// What adding a dish to the week really costs: the list total with it minus the
// list total without it. Shared packs (the carrots already in the bag) are free.
export function addedCost(data, plan, newItem, opts) {
  const before = shoppingList(data, plan, opts).dishTotal;
  const after = shoppingList(data, [...plan, { id: '__new', ...newItem }], opts).dishTotal;
  return Math.max(0, after - before);
}

// Dishes that use what the week already buys. For every dish not in the plan:
// which of its ingredients are already on the list, and what it adds to the bill
// for one evening. Only dishes that share at least `minShared` ingredients count;
// cheapest per portion first.
export function suggestions(data, plan, { stores, atHome = [], people = 2, filter = () => true, minShared = 2, limit = 3 }) {
  if (plan.length === 0) return [];
  const opts = { stores, atHome };
  const base = shoppingList(data, plan, opts);
  const planned = new Set(plan.map((p) => p.recipeId));
  const out = [];
  for (const recipe of data.recipes) {
    if (planned.has(recipe.id) || !filter(recipe)) continue;
    const shared = recipe.ingredients
      .map(({ id }) => id)
      .filter((id) => !data.ingredients[id].staple && (base.needs[id] || atHome.includes(id)));
    if (shared.length < minShared) continue;
    const after = shoppingList(data, [...plan, { id: '__new', recipeId: recipe.id, people, days: 1, staples: [] }], opts);
    const cost = Math.max(0, after.dishTotal - base.dishTotal);
    out.push({ recipe, shared, cost, perMeal: cost / people });
  }
  return out.sort((a, b) => a.perMeal - b.perMeal || b.shared.length - a.shared.length).slice(0, limit);
}
