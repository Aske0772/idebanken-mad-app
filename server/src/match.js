import { INGREDIENTS } from './ingredients.js';

const MATCHABLE = Object.entries(INGREDIENTS).filter(([, ing]) => ing.match);

// Pet food and ready meals mention real ingredients but are never something we cook with.
const NEVER = /foder|kattemad|hundemad|godbid|kæledyr|færdigret|bearnaise|snackpølse/i;

// Which canonical ingredients does an offer heading mention?
export function ingredientsFor(heading) {
  if (NEVER.test(heading)) return [];
  return MATCHABLE.filter(([, ing]) => ing.match.test(heading) && !ing.not?.test(heading)).map(
    ([id]) => id
  );
}

// Offer quantity (SI: kg / l / pcs) → amount in the ingredient's own unit.
// Returns null when the units can't be bridged (e.g. pieces of something we weigh
// but have no gram-per-piece figure for).
export function amountInUnit(quantity, ing) {
  if (!quantity) return null;
  const { unit, amount } = quantity;
  if (ing.unit === 'g') {
    if (unit === 'kg') return amount * 1000;
    if (unit === 'l') return amount * 1000;
    if (unit === 'pcs' && ing.gPerStk) return amount * ing.gPerStk;
  }
  if (ing.unit === 'ml') {
    if (unit === 'l') return amount * 1000;
    if (unit === 'kg') return amount * 1000;
  }
  if (ing.unit === 'stk') {
    if (unit === 'pcs') return amount * (ing.pcsAs ?? 1);
    if (unit === 'kg' && ing.gPerStk) return (amount * 1000) / ing.gPerStk;
  }
  return null;
}

// An offer whose unit price is far from the normal price is almost always a
// mismatch (multipack of something else, a spice jar sold as "kylling", etc).
// Avis offers can be deep discounts, so their window is wider than for shelf prices.
const AVIS_RATIO = [0.15, 6];
const SHELF_RATIO = [0.3, 3];

export function matchOffer(offer, { shelf = false } = {}) {
  if (offer.price == null || offer.price <= 0) return [];
  const [minRatio, maxRatio] = shelf ? SHELF_RATIO : AVIS_RATIO;
  // Shelf products carry brand and variant in the description ("1000 GR. / CHEASY, YOGHURT"),
  // so vetoes look there too. Avis descriptions are marketing text and are ignored.
  const ids = ingredientsFor(offer.heading).filter(
    (id) => !shelf || !INGREDIENTS[id].not?.test(offer.description ?? '')
  );
  const matches = [];
  for (const id of ids) {
    const ing = INGREDIENTS[id];
    let amount = amountInUnit(offer.quantity, ing);
    let assumed = false;
    if (amount == null) {
      // No usable size printed. A price for one piece (an agurk, a lime) is safe to
      // assume; a price for an unknown weight is not, so it is dropped.
      if (ing.unit !== 'stk') continue;
      amount = 1;
      assumed = true;
    }
    if (!(amount > 0)) continue;
    if (ing.minAmount && amount < ing.minAmount) continue;
    const ratio = offer.price / amount / (ing.normal[1] / ing.normal[0]);
    if (ratio < minRatio || ratio > maxRatio) continue;
    matches.push({ ingredientId: id, amount: round(amount), assumed });
  }
  return matches;
}

const round = (n) => Math.round(n * 100) / 100;
